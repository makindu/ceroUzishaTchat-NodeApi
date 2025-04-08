// const Sequelize = require('sequelize');
const messages =  require ('../messages/Messages.model');
const customer =   require('../customer/customer.model');
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    const Invoice = sequelize.define('invoices', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        edited_by_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        customer_id: {
          type: Sequelize.BIGINT(20),
          allowNull: false,
           references: {
                      model: customer,  
                      key: 'id'
                  }
        },
        total: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        back: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        total_ht: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        totalespeces: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        totalcreditcard: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
    
    amount_paid: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    payment_mode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    ref_payment: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    discount: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    vat_amount: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    vat_percent: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    is_validate_discount: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    enterprise_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    note: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    servant_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    table_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    sync_status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      unique: true,
    },
    total_received: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    netToPay: {
        type: Sequelize.FLOAT,
      allowNull: false,
    },
    done_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
    },
    date_operation: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    collector_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'invoices', // Nom de la table
    timestamps: false, // Désactive les timestamps par défaut (createdAt, updatedAt)
  });
   // Invoice.belongsTo(models.Customer, { foreignKey: 'customer_id' });

  return Invoice;
}

