const express = require("express"); // получаем модуль express
const cors = require("cors");
const dayjs = require("dayjs");
require("dayjs/locale/ru");
dayjs.locale("ru");

// создаем приложение express
const app = express();
app.use(cors());
app.use(express.json());

const Sequelize = require("sequelize");

const sequelize = new Sequelize("coach_client", "ivan", "qwerty", {
  dialect: "postgres",
});

try {
  sequelize.authenticate();
  console.log("Соединение с БД было успешно установлено");
} catch (e) {
  console.log("Невозможно выполнить подключение к БД: ", e);
}

var today = dayjs().format("YYYY-MM-DD")
console.log(today, ',-----------------------todaaaaaay');

// const Coach_table = sequelize.define("coach_table", {
//   coach_id: {
//     type: Sequelize.UUID,
//     defaultValue: Sequelize.UUIDV4,
//     primaryKey: true,
//     allowNull: false,
//   },
//   coach_name: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   coach_patronymic: {
//     type: Sequelize.STRING,
//   },
//   coach_surname: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   coach_password: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   refresh_key_coach: {
//     type: Sequelize.TEXT,
//   },
//   coach_phone_number: {
//     type: Sequelize.INTEGER,
//     allowNull: false,
//   },
//   coach_birthday: {
//     type: Sequelize.DATEONLY,
//     allowNull: false,
//   },
//   coach_email: {
//     type: Sequelize.STRING,
//   },
//   coach_role: {
//     type: Sequelize.STRING,
//     defaultValue: "coach",
//   },
// });

const ClientTable = sequelize.define("client_table", {
  client_id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  client_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  client_patronymic: {
    type: Sequelize.STRING,
  },
  client_surname: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  client_password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  refresh_key_client: {
    type: Sequelize.TEXT,
  },
  client_phone_number: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  client_birthday: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  client_email: {
    type: Sequelize.STRING,
  },
  client_role: {
    type: Sequelize.STRING,
    defaultValue: "client",
  },
  client_registration_date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.DATEONLY,
  },
  client_pass: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  client_balance_activities: {
    type: Sequelize.INTEGER,
  },
  client_job: {
    type: Sequelize.STRING,
  },
  client_illness: {
    type: Sequelize.STRING,
  },
  client_messenger: {
    type: Sequelize.STRING,
  },
});

const ActivityTable = sequelize.define("activity_table", {
  training_id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  type_of_training: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  occupancy_train: {
    type: Sequelize.INTEGER,
  },
  weekday_train: {
    type: Sequelize.DATEONLY,
  },
  start_time_train: {
    type: Sequelize.STRING,
  },
  end_time_train: {
    type: Sequelize.STRING,
  },
});

sequelize
  .sync()
  .then((result) => {
    // параметр {force: true}, чтобы удалить таблицы и создать их заново, но уже с нужной нам структурой

  })
  .catch((err) => console.log(err));

// --------------------------------------------------------------запрос тренировок ---------------------------
app.get("/activities", async (req, res) => {

  const sport = await ActivityTable.findAll({
    raw: true,
    order: [
      // массив для сортировки начинается с модели
      // затем следует название поля и порядок сортировки
      ["start_time_train", "ASC"],
    ],
    where: {
    weekday_train: today,
  }, 
  });

  res.status(200).json(sport);
});
// --------------------------------------------------------------запрос тренировок ---------------------------
// --------------------------------------------------------------создать тренировку ---------------------------
app.post("/add_activity", (req, res) => {

  let values = req.body;

  ActivityTable.create({
    type_of_training: values.type_of_training,
    occupancy_train: parseInt(values.occupancy_train),
    start_time_train: dayjs(values.start_time_train).format("YYYY-MM-DD HH:mm"),
    end_time_train: dayjs(values.end_time_train).format("YYYY-MM-DD HH:mm"),
    //concatinated_time: `${dayjs(values.time[0]).format('HH:mm')} - ${dayjs(values.time[1]).format('HH:mm')}`,
    weekday_train: dayjs(values.weekday_train).format("YYYY-MM-DD"),
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));

  if (!req.body) return res.status(400).json("node node");
});
// --------------------------------------------------------------создать тренировку ---------------------------
// --------------------------------------------------------------удаление тренировки ---------------------------
app.delete("/delete_activity", async (req, res) => {

  let values = req.body.training_id;


  await ActivityTable.destroy({
    where: {
      training_id: values,
    },
    individualHooks: true,
  }).catch((err) => console.log(err));

  await ActivityTable.findAll({
    raw: true,
    order: [
      // массив для сортировки начинается с модели
      // затем следует название поля и порядок сортировки
      ["start_time_train", "ASC"],
    ],
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));
});
// --------------------------------------------------------------удаление тренировки ---------------------------
// --------------------------------------------------------------изменение тренировки ---------------------------
app.put("/update_activity", async (req, res) => {
  let values = req.body;
  await ActivityTable.update(
    {
      type_of_training: values.type_of_training,
      occupancy_train: parseInt(values.occupancy_train),
      start_time_train: dayjs(values.start_time_train).format(
        "YYYY-MM-DD HH:mm"
      ),
      end_time_train: dayjs(values.end_time_train).format("YYYY-MM-DD HH:mm"),
    },
    {
      where: {
        training_id: values.training_id,
      },
    }
  ).catch((err) => console.log(err));

  await ActivityTable.findAll({
    raw: true,
    order: [
      // массив для сортировки начинается с модели
      // затем следует название поля и порядок сортировки
      ["start_time_train", "ASC"],
    ],
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));
});
// --------------------------------------------------------------изменение тренировки ---------------------------

// --------------------------------------------------------------создать тренировку ---------------------------
app.post("/add_activity", (req, res) => {

  let values = req.body;

  ClientTable.create({
    client_phone_number:  parseInt(values.client_phone_number),
    client_password: values.client_password,
    client_name: values.client_name,
    end_time_train: dayjs(values.end_time_train).format("YYYY-MM-DD HH:mm"),
    //concatinated_time: `${dayjs(values.time[0]).format('HH:mm')} - ${dayjs(values.time[1]).format('HH:mm')}`,
    weekday_train: dayjs(values.weekday_train).format("YYYY-MM-DD"),
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));

  if (!req.body) return res.status(400).json("node node");
});
// --------------------------------------------------------------создать тренировку ---------------------------

// --------------------------------------------------------------отобразить тренировки по дате---------------------------
app.post("/date_activity",async (req, res) => {

  let values = req.body;
  console.log(values);
  const sport = await ActivityTable.findAll({
    raw: true,
    order: [
      // массив для сортировки начинается с модели
      // затем следует название поля и порядок сортировки
      ["start_time_train", "ASC"],
    ],
    where: {
    weekday_train: values.date,
  }, 
  });

  res.status(200).json(sport);

});
// --------------------------------------------------------------отобразить тренировки по дате ---------------------------
// --------------------------------------------------------------регистрация или вход---------------------------
app.post("/SignInOrRegistration",async (req, res) => {

  let values = req.body;
  console.log(values);

  const signIn = await ClientTable.findOne({  raw: true, where: { client_phone_number: values.phone_number } })


  if (signIn) {
    res.status(200).json("sign");
  } else{
    res.status(200).json("reg");
  }

});
// --------------------------------------------------------------регистрация или вход ---------------------------
// --------------------------------------------------------------вход авторизация---------------------------
app.post("/signIn",async (req, res) => {

  let values = req.body;
  console.log(values);

  const signIn = await ClientTable.findOne({  raw: true, where: { client_phone_number: values.phone_number, client_password: values.password } })


  if (signIn) {
    res.status(200).json("sign");
  } else{
    res.status(200).json("nooooooooooooo");
  }

});
// --------------------------------------------------------------вход авторизация---------------------------
// -------------------------------------------------------------- регистрация---------------------------
app.post("/registration",async (req, res) => {

  let values = req.body;
  console.log(values);



});
// --------------------------------------------------------------регистрация---------------------------
// начинаем прослушивание подключений на 3000 порту
app.listen(3500, function () {
  console.log("Сервер начал принимать запросы по адресу http://localhost:3000");
});
