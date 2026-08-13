const { User, Group, GroupMember, FitnessProfile } = require('./backend/models');
const sequelize = require('./backend/config/db');

async function test() {
  await sequelize.authenticate();
  const groups = await Group.findAll({
    include: [
      {
        model: GroupMember,
        where: { status: 'approved' },
        required: false,
        include: [
          {
            model: User,
            include: [
              {
                model: FitnessProfile,
                as: 'FitnessProfile'
              }
            ]
          }
        ]
      }
    ]
  });

  console.log(JSON.stringify(groups, null, 2));
  process.exit();
}

test();
