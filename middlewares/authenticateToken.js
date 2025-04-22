const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { use } = require("../index.route");
const Users = require("../db.provider").Users;
const Token = require("../db.provider").Token;
const getIo = require("../socket").getIo;
const getUserSocketId = require("../socket").getUserSocketId;
// const authenticateToken = async(req, res, next) => {
//     try {
//         const authHeader = req.headers["authorization"];
//         const token = authHeader && authHeader.split(" ")[1];
      
//         if (!token) { 
//             res.status(401).send({message:"Error", error: "le jeton de l'utilisateur est invalide", data: null});
//           return ;
//         }
      
//         jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//           if (err) {
//             res.status(403).send({message:"Error", error: err.toString(), data: null});

//             // res.sendStatus(403);
//             return 
//           }else{

//               req.user = user;
//               next();
//           }
//         });
        
//     } catch (error) {
//         res.status(401).send({message:"Error", error:error.toString(), data: null});
//         return;
//     }
// };

const authenticateToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  console.log("Authorization header:", req.headers["authorization"]);
  if (!token) return res.status(401).json({ message:"Error", error: "Token requis", data: null });
  
  const tokenEntry = await Token.findOne({ where: { token:token } });
  if (!tokenEntry) return res.status(403).json({ message: "Error",error: "Invalid or expired user token", data: null });
  
  // console.log("Token extrait:", token);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.token = decoded;

    await tokenEntry.update({ last_used_at: new Date() }); // mise à jour
    next();
  } catch (err) {
    return res.status(403).json({ message:"Error", error: err.toString(), data: null,  });
  }
};
const login = async (req, res) => {
  const { user_name, user_password } = req.body;

  const user = await Users.findOne({ where: { user_password } });
  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

  let valid = false
  if (user_password !== user.user_password) 
    {
      valid = valid;
    }
    else if(user_name !==user.user_name )
    {
    valid = valid;
    
    }
    else
    {
    valid = true
    };
  if (!valid) {
      res.status(401).json({ message: "Error", error:"Mot de passe ou nom d'utilisateur incorect", data: null });
    return ;
}
  const token = jwt.sign({ id: user.id, user_name }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  const dataToken = await Token.create({
    tokenable_type: "User",
    tokenable_id: user.id,
    name: "auth_token",
    token: token,
    abilities: JSON.stringify(["*"]),
    last_used_at: new Date(),
  });
if (dataToken) {
    
    res.status(200).json({message:"Success", error:"null", data:{
      user: user,
      token: token
    } });
    return;
}else{
    res.status(401).json({ message: "Error", error:"Error lors de l'enregistrement du jeton de l'utilisateur", data: null });

}
};

const logout = async (req, res) => {
  if (!req.body.user_id) {
    res.status(500).json({ message: "Error", error: "some data is required", data: null });
    return;
  }
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token manquant" });
  
    const destroy = await Token.destroy({ where: { token:token, tokenable_id: req.body.user_id } });
    if (destroy) {
      const usersSocket = getUserSocketId(req.body.user_id);
                if (usersSocket) {
                  getIo().to(usersSocket).emit("logout", { message: "Success", error:null, data:"logout succed"});}
      res.json({ message: "Success", error:null, data:"logout succed" });
      return;
    }else{
      res.json({ message: "Error", error:null, data:"logout failled" });
      return;
      
    }
  } catch (error) {
    res.json({ message: "Error", error:error.toString(), data:null });
      return;
  }
};

const validateToken = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token manquant" });

  const tokenEntry = await Token.findOne({ where: { token } });
  if (!tokenEntry) return res.status(403).json({ message: "Token invalide ou expiré" });

  res.json({ valid: true, token: tokenEntry });
};


module.exports = {authenticateToken,login,logout,validateToken};
