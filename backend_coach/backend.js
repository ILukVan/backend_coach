const express = require("express"); // получаем модуль express
const cors = require("cors");
const dayjs = require("dayjs");
require("dayjs/locale/ru");
dayjs.locale("ru");
// подключаем bcrypt
var bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

const jwt = require("jsonwebtoken");

// создаем приложение express
const app = express();
app.use(cors());
app.use(express.json());

const Sequelize = require("sequelize");

const sequelize = new Sequelize("coach_client", "ivan", "qwerty", {
  // host: '192.168.3.18',
  dialect: "postgres",
  logging: false,
});

try {
  sequelize.authenticate();
  console.log("Соединение с БД было успешно установлено");
} catch (e) {
  console.log("Невозможно выполнить подключение к БД: ", e);
}

var today = dayjs().format("YYYY-MM-DD");

let foreignId;

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
//     type: Sequelize.STRING,
//     allowNull: false,
//     unique: true,
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
    unique: true,
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
  client_fio: {
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
    unique: true,
  },
  client_birthday: {
    type: Sequelize.DATEONLY,
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
    defaultValue: today,
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
  client_attended_train: {
    type: Sequelize.ARRAY(Sequelize.TEXT),
    defaultValue: [],
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
  description_of_train: {
    type: Sequelize.TEXT,
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
  coach_train: {
    type: Sequelize.STRING,
  },
  client_id: {
    type: Sequelize.UUID,
    references: {
      model: "client_tables",
      key: "client_id",
    },
  },
  // recorded_client: {
  //   type: Sequelize.ARRAY(Sequelize.TEXT),
  //   defaultValue: [],
  // },
});

const ActivityTypesTable = sequelize.define("activity_type_table", {
  workout_id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  type_of_workout: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description_of_workout: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  client_id: {
    type: Sequelize.UUID,
    references: {
      model: "client_tables",
      key: "client_id",
    },
  },
});

const ActivityAndClientTable = sequelize.define(
  "activity_and_client_table",
  {},
  { timestamps: false }
);

ActivityTable.belongsToMany(ClientTable, {
  through: ActivityAndClientTable,
  foreignKey: "training_id",
});
ClientTable.belongsToMany(ActivityTable, {
  through: ActivityAndClientTable,
  foreignKey: "client_id",
});

ClientTable.hasMany(ActivityTable, {
  foreignKey: "client_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ClientTable.hasMany(ActivityTypesTable, {
  foreignKey: "client_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

sequelize
  .sync()
  .then((result) => {
    // параметр {force: true}, чтобы удалить таблицы и создать их заново, но уже с нужной нам структурой
  })
  .catch((err) => console.log(err));

// --------------------------------------------------------------регистрация или вход---------------------------
app.post("/SignInOrRegistration", async (req, res) => {
  let values = req.body;

  const signIn = await ClientTable.findOne({
    raw: true,
    where: { client_phone_number: values.phone_number },
  });

  if (signIn) {
    res.status(200).json("sign");
  } else {
    res.status(200).json("reg");
  }
});
// --------------------------------------------------------------регистрация или вход ---------------------------
// --------------------------------------------------------------вход авторизация---------------------------
app.post("/signIn", async (req, res) => {
  let values = req.body;

  const signIn2 = await ClientTable.findOne({
    raw: true,
    where: { client_phone_number: values.phone_number },
  });

  bcrypt.compare(
    values.password,
    signIn2.client_password,
    async function (error, result) {
      if (result) {
        // авторизируем юзера
        const result = await generateFreshforDB(signIn2);
        console.log("вход выполнен");

        res.status(200).json(result);
      } else {
        console.log(error);
        res.status(403).json("Неверный пароль");
      }
    }
  );
});
// --------------------------------------------------------------вход авторизация---------------------------
// -------------------------------------------------------------- регистрация---------------------------
app.post("/registration", async (req, res) => {
  let values = req.body;

  const fioDB =
    values.client_surname +
    " " +
    values.client_name +
    (values.client_patronymic !== undefined || values.client_patronymic !== null
      ? " " + values.client_patronymic
      : "");

  ClientTable.create({
    client_phone_number: values.phone_number,
    client_password: bcrypt.hashSync(values.client_password, salt),
    client_name: values.client_name,
    client_patronymic: values.client_patronymic,
    client_surname: values.client_surname,
    client_fio: fioDB,
    client_email: values.client_email,
    client_birthday: dayjs(values.client_birthday).format("YYYY-MM-DD"),
    client_job: values.client_job,
    client_illness: values.client_illness,
    client_messenger: (values.client_messenger || []).join() || "noMessengers",
  })
    .then(async (data) => {
      console.log("Регистрация успешна");
      const user = data.dataValues;
      console.log(user);
      const result = await generateFreshforDB(user);
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(
        "----------------------Ошибка регистарции------------------------------- "
      );
      console.log(err);
      res.status(406).json("Ошибка регистрарции");
    });
});
// --------------------------------------------------------------регистрация---------------------------

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
    logging: false,
  });
  addStatusTrain(sport);
  res.status(200).json(sport);
});
// --------------------------------------------------------------запрос тренировок -----------------------
// --------------------------------------------------------------отобразить тренировки по дате---------------------------
app.post("/date_activity", async (req, res) => {
  let values = req.body;
  let dateSelect = dayjs(values.data);


  if (dayjs.isDayjs(dateSelect)) {
    console.log("здесь есть?");
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
    addStatusTrain(sport);
    await trainVisiters(sport)

    res.status(200).json(sport);
    console.log("отправил расписание");
  } else {
    res.status(200).json(null);
  }
});
// --------------------------------------------------------------отобразить тренировки по дате ---------------------------
// --------------------------------------------------------------запрос типов тренировки ---------------------------
app.get("/workout_list", async (req, res) => {
  const workout = await ActivityTypesTable.findAll({
    raw: true,
    logging: false,
  });
  console.log("tut");
  res.status(200).json(workout);
  console.log("tut2");
});
// --------------------------------------------------------------запрос типов тренировки ----------------------
// --------------------------------------------------------------запрос всех тренеров ---------------------------
app.get("/coaches_list", async (req, res) => {
  const coaches = await ClientTable.findAll({
    raw: true,
    logging: false,
    where: { client_job: "тренер студии" },
    attributes: ["client_fio"],
    order: [
      // массив для сортировки начинается с модели
      // затем следует название поля и порядок сортировки
      ["client_fio", "ASC"],
    ],
  });

  res.status(200).json(coaches);
});
// --------------------------------------------------------------запрос всех тренеров ----------------------
// ----------------------------------------------------------- прослойка для аутентификации----------------
app.use(async function (req, res, next) {
  let tokens = JSON.parse(req.get("Authorization").replace("Bearer ", ""));

  if (!tokens) {
    return res.status(404).end();
  }

  if (verifyAccessToken(tokens.token).success) {
    foreignId = verifyAccessToken(tokens.token).data.id;
    console.log("первый этап");
    next();
  } else if (await findRefreshDB(tokens.refreshToken)) {
    const tokensSend = await refreshRefreshTokenDB(tokens.refreshToken);

    res.status(401).json(tokensSend).end();

    console.log("Второй этап");
    // next();
  } else {
    console.log("Третий этап");
    res.sendStatus(403);
  }
});
// ----------------------------------------------------------- прослойка для аутентификации----------------

// --------------------------------------------------------------создать тренировку ---------------------------
app.post("/add_activity", async (req, res) => {
  let values = req.body;

  let start_time =
    dayjs(values.weekday_train).format("YYYY-MM-DD") +
    " " +
    dayjs(values.start_time_train).format("HH:mm");
  let end_time =
    dayjs(values.weekday_train).format("YYYY-MM-DD") +
    " " +
    dayjs(values.end_time_train).format("HH:mm");

  const description = await ActivityTypesTable.findOne({
    raw: true,
    where: { type_of_workout: values.type_of_training },
    logging: false,
  }).catch((err) =>
    console.log("-------------------------find Refresh      --- ", err)
  );

  ActivityTable.create({
    type_of_training: values.type_of_training,
    occupancy_train: parseInt(values.occupancy_train),
    start_time_train: start_time,
    end_time_train: end_time,
    description_of_train: description.description_of_workout,
    //concatinated_time: `${dayjs(values.time[0]).format('HH:mm')} - ${dayjs(values.time[1]).format('HH:mm')}`,
    weekday_train: dayjs(values.weekday_train).format("YYYY-MM-DD"),
    client_id: foreignId,
    coach_train: await createFIO(foreignId),
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
  let delDate = req.body.date;

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
    where: {
      weekday_train: delDate || today,
    },
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
      description_of_train: values.description,
    },
    {
      where: {
        training_id: values.training_id,
      },
    }
  ).catch((err) => console.log("ediiiiiiiiit      --- ", err));

  await ActivityTable.findAll({
    raw: true,
    order: [
      // массив для сортировки начинается с модели
      // затем следует название поля и порядок сортировки
      ["start_time_train", "ASC"],
    ],
    where: {
      weekday_train: values.date || today,
    },
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));
});
// --------------------------------------------------------------изменение тренировки ---------------------------

// --------------------------------------------------------------выход из аккаунта ---------------------------
app.get("/logout", async (req, res) => {
  console.log("Выход из аккаунта");
  let tokens = JSON.parse(req.get("Authorization").replace("Bearer ", ""));

  const user = await verifyRefreshToken(tokens.refreshToken).data;

  const logout = await ClientTable.update(
    { refresh_key_client: "logout" },
    {
      where: {
        client_id: user.id,
      },
    }
  )
    .then((data) => {
      res.status(200).json("успех");
    })
    .catch((err) => console.log(err));
});
// --------------------------------------------------------------выход из аккаунта ---------------------------

// --------------------------------------------------------------запрос клиентов ---------------------------
app.get("/client_list", async (req, res) => {
  const clients = await ClientTable.findAll({
    raw: true,
    logging: false,
    where: { client_role: "client" },
  });

  res.status(200).json(clients);
});
// --------------------------------------------------------------запрос клиентов ----------------------
// --------------------------------------------------------------запрос тренеров ---------------------------
app.get("/coach_list", async (req, res) => {
  const coaches = await ClientTable.findAll({
    raw: true,
    logging: false,
    where: { client_role: "coach" },
  });

  res.status(200).json(coaches);
});
// --------------------------------------------------------------запрос тренеров ----------------------

// --------------------------------------------------------------сделать тренером ---------------------------
app.post("/create_coach", async (req, res) => {
  let values = req.body;

  const newRole = await ClientTable.update(
    { client_role: "coach", client_job: "тренер студии" },
    {
      where: {
        client_id: values.client_id,
      },
    }
  ).catch((err) => console.log(err));

  const clients = await ClientTable.findAll({
    raw: true,
    logging: false,
    where: { client_role: "client" },
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));
});
// --------------------------------------------------------------сделать тренером  ---------------------------
// --------------------------------------------------------------удаление тренера ---------------------------
app.delete("/delete_coach", async (req, res) => {
  let value = req.body.id;

  await ClientTable.destroy({
    where: {
      client_id: value,
    },
    individualHooks: true,
  }).catch((err) => console.log(err));

  await ClientTable.findAll({
    raw: true,
    where: {
      client_role: "coach",
    },
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));
});
// --------------------------------------------------------------удаление тренера ---------------------

// --------------------------------------------------------------запись на тренировку---------------------------
app.post("/sign_up_train", async (req, res) => {
  let values = req.body;

  await ActivityAndClientTable.create({
    training_id: values.training_id,
    client_id: foreignId,
  });

  res.status(200).json("записан");
});
// --------------------------------------------------------------запись на тренировку ---------------------------
// --------------------------------------------------------------отпись от тренировки---------------------------
app.post("/unsign_up_train", async (req, res) => {
  let values = req.body;

  await ActivityAndClientTable.destroy({
    where: {
      client_id: values.client_id,
      training_id: values.training_id, 
    },
    individualHooks: true,
  }).catch((err) => console.log(err));

  res.status(200).json("отписан");
});
// --------------------------------------------------------------отпись от тренировки ---------------------------
// --------------------------------------------------------------запрос клиентов для записи---------------------------
app.post("/client_list_for_coach", async (req, res) => {
  const value = req.body.training_id;
  const list = await makeDifferente(value);

  res.status(200).json(list);
});
// --------------------------------------------------------------запрос клиентов для записи ----------------------
// --------------------------------------------------------------тренер записывает на тренировку  клиента--------------------------
app.post("/sign_up_train_coach", async (req, res) => {
  let values = req.body;

  await ActivityAndClientTable.create({
    training_id: values.training_id,
    client_id: values.client_id,
  });

  const list = await makeDifferente(values.training_id);

  res.status(200).json(list);
});
// --------------------------------------------------------------тренер записывает на тренировку  клиента---------------------------
// --------------------------------------------------------------тренер отписывает от тренировки клиента---------------------------
app.post("/unsign_up_train_coach", async (req, res) => {
  let values = req.body;

  await ActivityAndClientTable.destroy({
    where: {
      client_id: values.client_id,
      training_id: values.training_id, 
    },
    individualHooks: true,
  }).catch((err) => console.log(err));

  const list = await makeDifferente(values.training_id);

  res.status(200).json(list);
});
// --------------------------------------------------------------тренер отписывает от тренировки клиента---------------------------

// --------------------------------------------------------------создать тип тренировки ---------------------------
app.post("/add_workout", (req, res) => {
  let values = req.body;

  ActivityTypesTable.create({
    type_of_workout: values.type_of_workout,
    description_of_workout: values.description_of_workout,
    client_id: foreignId,
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));

  if (!req.body) return res.status(400).json("node node");
});
// --------------------------------------------------------------создать тип тренировки ---------------------------
// --------------------------------------------------------------удаление типа тренировки ---------------------------
app.delete("/delete_workout_activity", async (req, res) => {
  let values = req.body.training_id;

  await ActivityTypesTable.destroy({
    where: {
      workout_id: values,
    },
    individualHooks: true,
  }).catch((err) => console.log(err));

  await ActivityTypesTable.findAll({
    raw: true,
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));
});
// --------------------------------------------------------------удаление типа тренировки ---------------------------
// --------------------------------------------------------------изменение типа тренировки ---------------------------
app.put("/update_workout", async (req, res) => {
  let values = req.body;
  await ActivityTypesTable.update(
    {
      type_of_workout: values.type_of_workout,
      description_of_workout: values.description_of_workout,
    },
    {
      where: {
        workout_id: values.workout_id,
      },
    }
  ).catch((err) => console.log("ediiiiiiiiit  type    --- ", err));

  await ActivityTypesTable.findAll({
    raw: true,
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));
});
// --------------------------------------------------------------изменение типа тренировки ---------------------------
// --------------------------------------------------------------запрос профиля пользователя---------------------------
app.post("/profile", async (req, res) => {
  let id = req.body.id;

  const clientProfile = await ClientTable.findOne({
    raw: true,
    logging: false,
    attributes: [
      "client_phone_number",
      "client_name",
      "client_patronymic",
      "client_surname",
      "client_fio",
      "client_birthday",
      "client_email",
      "client_registration_date",
      "client_job",
      "client_illness",
      "client_messenger",
    ],
    where: { client_id: id },
  });

  res.status(200).json(clientProfile);
});
// --------------------------------------------------------------запрос профиля пользователя ----------------------
// --------------------------------------------------------------запрос посещенных тренировок---------------------------
app.post("/visited_trains", async (req, res) => {
  let visited = [];
  let id = req.body;
 
 
  const visited_trains = await ActivityAndClientTable.findAll({
    raw: true,
    logging: false,
    attributes: ["training_id"],
    where: { client_id: foreignId },
  });


  for (const train of visited_trains) {
    const visit_train = await ActivityTable.findOne({
      raw: true,
      logging: false,
      attributes: ["type_of_training", "start_time_train", "training_id"],
      where: { training_id: train.training_id },
    });

    visited.push(visit_train);
  }


  res.status(200).json(visited);
});
// ---------------------------------------------------------------запрос посещенных тренировок ----------------------
// --------------------------------------------------------------изменение профиля пользовтеля ---------------------------
app.put("/update_profile", async (req, res) => {
  let values = req.body;
  console.log(values, "------------------------ новые данные");

  const fioDB =
    values.client_surname +
    " " +
    values.client_name +
    (values.client_patronymic !== undefined || values.client_patronymic !== null
      ? " " + values.client_patronymic
      : "");

  const updateData = await ClientTable.update(
    {
      client_phone_number: values.client_phone_number,
      client_name: values.client_name,
      client_patronymic: values.client_patronymic,
      client_birthday: dayjs(values.client_birthday).format("YYYY-MM-DD"),
      client_fio: fioDB,
      client_email: values.client_email,
      client_job: values.client_job,
      client_illness: values.client_illness,
    },
    {
      where: {
        client_id: values.client_id,
      },
    }
  ).catch((err) => console.log("ediiiiiiiiit      --- ", err));

  const clientProfile = await ClientTable.findOne({
    raw: true,
    logging: false,
    attributes: [
      "client_phone_number",
      "client_name",
      "client_patronymic",
      "client_surname",
      "client_fio",
      "client_birthday",
      "client_email",
      "client_registration_date",
      "client_job",
      "client_illness",
      "client_messenger",
    ],
    where: { client_id: values.client_id },
  });
  console.log(updateData);
  console.log(clientProfile);
  res.status(200).json(clientProfile);
});

// --------------------------------------------------------------изменение профиля пользовтеля ---------------------------
// --------------------------------------------------------------функция вывода клиентов и записавшихся клиентов---------------------------
async function makeDifferente(training_id) {
  console.log(training_id);
  let recorded_clients = [];
  const recorded_client = await ActivityAndClientTable.findAll({
    raw: true,
    logging: false,
    attributes: ["client_id"],
    where: { training_id: training_id },
  });
  console.log(recorded_client);
  for (const client of recorded_client) {
    const clientFio = await ClientTable.findOne({
      raw: true,
      logging: false,
      attributes: ["client_fio", "client_id"],
      where: { client_id: client.client_id },
    });

    recorded_clients.push(clientFio);
  }

  const clients = await ClientTable.findAll({
    raw: true,
    logging: false,
    where: { client_role: "client" },
    attributes: ["client_fio", "client_id"],
    order: [["client_fio", "ASC"]],
  });


  let difference = clients.filter(person_A => !recorded_clients.some(person_B => person_A.client_id === person_B.client_id));


  // difference.unshift("Пробник", "Нет регистрации");
  const recordAndDifference = {
    recorded: recorded_clients,
    difference: difference,
  };
  return recordAndDifference;
}
// --------------------------------------------------------------функция вывода клиентов и записавшихся клиентов----------------------

// начинаем прослушивание подключений на 3000 порту
app.listen(3500, function () {
  console.log("Сервер начал принимать запросы по адресу http://localhost:3500");
});

async function generateAccessToken(user) {
  const payload = {
    id: user.client_id,
    name: await createFIO(user.client_id),
    role: user.client_role,
  };

  const secret = "ivan";
  const options = { expiresIn: "10s" };

  return jwt.sign(payload, secret, options);
}

function generateRefreshToken(value) {
  const payload = {
    id: value,
  };
  const secret = "Luk";
  const options = { expiresIn: "30d" };

  return jwt.sign(payload, secret, options);
}

function verifyAccessToken(token) {
  const secret = "ivan";

  try {
    const decoded = jwt.verify(token, secret);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function verifyRefreshToken(token) {
  const secret = "Luk";

  try {
    const decoded = jwt.verify(token, secret);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function generateFreshforDB(user) {
  let freshKey = await generateRefreshToken(user.client_id);

  let newFresh = await ClientTable.update(
    {
      refresh_key_client: freshKey,
    },
    {
      where: {
        client_id: user.client_id,
      },
      returning: true,
      plain: true,
      logging: false,
    }
  );

  try {
    const freshDB = newFresh[1].dataValues.refresh_key_client;

    const userAccess = {
      token: await generateAccessToken(user),
      refreshToken: freshDB,
    };

    return userAccess;
  } catch (error) {
    console.error("Error inserting data", error);
  }

  // return userAccess;
}

async function refreshRefreshTokenDB(reToken) {
  let reId = await verifyRefreshToken(reToken).data.id;
  let user = await findRefreshInDB(reId);

  if (reToken === user.refresh_key_client) {
    return await generateFreshforDB(user);
  }
}
async function findRefreshDB(reToken) {
  let reId = await verifyRefreshToken(reToken).data.id;
  let user = await findRefreshInDB(reId);

  if (user.refresh_key_client === reToken) {
    console.log("токены совпали");
  } else {
    console.log("не совпали");
  }
  return user.refresh_key_client === reToken;
}

async function findRefreshInDB(id) {
  let user;
  let reTokenDB = await ClientTable.findOne({
    raw: true,
    where: { client_id: id },
    logging: false,
  }).catch((err) =>
    console.log("-------------------------find Refresh      --- ", err)
  );

  try {
    user = reTokenDB;
  } catch (error) {
    console.error("Error inserting data", error);
    // return userAccess;
  }

  // let user = results.rows[0];
  return user;
}
// -------------------------------------------------------функция проверки статуса тренировки ----------------------------------------------
function setStatusTrain(start, end) {
  if (dayjs() > dayjs(end)) {
    return "тренировка завершена";
  } else if (dayjs() < dayjs(start)) {
    return "тренировка запланирова";
  } else {
    return "тренировка в процессе";
  }
}
// -------------------------------------------------------функция проверки статуса тренировки ----------------------------------------------
// ------------------------------------функция добавления статуса тренировки к тренировкам -----------------------------------------
function addStatusTrain(trains) {
  trains.forEach((element) => {
    let statusTrain = setStatusTrain(
      element.start_time_train,
      element.end_time_train
    );
    element.status_train = statusTrain;
    element.recorded_client = []
  });

}
// ------------------------------------функция добавления статуса тренировки к тренировкам -----------------------------------------
// ------------------------------------функция добавления записанных клиентов к тренировкам -----------------------------------------
async function trainVisiters(trains) {

  for (const train of trains) {
    const train_visiters = await ActivityAndClientTable.findAll({
      raw: true,
      logging: false,
      attributes: ["client_id"],
      where: { training_id: train.training_id },
    });

    for (const client of train_visiters) {
      const fioForTrain = await ClientTable.findOne({
        raw: true,
        logging: false,
        attributes: ["client_fio"],
        where: { client_id: client.client_id },
      });
      train.recorded_client.push(fioForTrain.client_fio)
    }
  }
}  
// ------------------------------------функция добавления записанных клиентов к тренировкам -----------------------------------------
async function createFIO(id) {
  const user = await ClientTable.findOne({
    raw: true,
    where: { client_id: id },
  });
  const fioFunc = `${user.client_surname} ${user.client_name} ${
    user.client_patronymic ?? ""
  } `.trim();
  const fio = fioFunc.replace(/ +/g, " ").trim();
  return fio;
}
