const allconstant = {};
//  users constante 
allconstant.Userattributes =  [
    'id', 'user_name', 'full_name', 'user_mail', 'user_phone', 
    'user_type', 'status', 'note', 'avatar', 'uuid', 'collector'
  ];
allconstant.messageattributes = [
'id',
'content',
'medias',
'senderId',
'receiverId',
'read_at',
'enterprise_id',
'conversation_id',
'status',
'ResponseId'
];
allconstant.mentionsattribute =  [
  
'id',
'message_id',
'mentioned_user_id',
];
allconstant.refeencesattribute = [
'id',
'message_id',
'reference_type',
'reference_code',
];
allconstant.convesationAttribut = [
"id",
"status",
"first_user",
"second_user",
"group_name",
"description",
"type",
"createdAt",
"updatedAt",
"enterprise_id",
]
allconstant.capitalizeFirstLetter = (input) => {
  if (!input) return '';
  const string = String(input);
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
module.exports =  allconstant;