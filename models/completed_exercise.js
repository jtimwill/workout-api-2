module.exports = function(sequelize, DataTypes) {
  return sequelize.define('completed_exercise', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    exercise_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unilateral: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reps: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    load: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {});
};
