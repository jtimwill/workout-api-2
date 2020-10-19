module.exports = function(sequelize, DataTypes) {
  return sequelize.define('target_exercise', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    exercise_type: {
      type: DataTypes.STRING,
      allowNull: false,
      isIn: [['bodyweight', 'free weight', 'cable', 'machine']]
    },
    unilateral: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      min: 1
    },
    reps: {
      type: DataTypes.INTEGER,
      allowNull: false,
      min: 1
    },
    load: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    }
  }, {});
};
