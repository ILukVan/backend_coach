const express = require("express"); // получаем модуль express
const cors = require("cors");
const dayjs = require("dayjs");
const nodemailer = require("nodemailer");
const uuid = require("uuid");
require("dotenv").config();

const DeviceDetector = require("node-device-detector");
const ClientHints = require("node-device-detector/client-hints");

const detector = new DeviceDetector({
  clientIndexes: false,
  deviceIndexes: false,
  deviceAliasCode: true,
  deviceTrusted: false,
  deviceInfo: true,
  maxUserAgentSize: 500,
});

const clientHints = new ClientHints();

const directTransport = require("nodemailer-direct-transport");
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

const sequelize = new Sequelize(
  process.env.DataBase,
  process.env.userDB,
  process.env.passwordDB,
  {
    // host: '192.168.3.18',
    dialect: "postgres",
    logging: false,
  }
);

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
    unique: true,
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
    type: Sequelize.INTEGER,
    defaultValue: 0,
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
  client_restore: {
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
});

const ConstructorActivityTable = sequelize.define("constructor_activity_table", {
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
    type: Sequelize.STRING,
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

const AccsessDevice = sequelize.define("accsess_device_table", {
  client_id: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: "client_tables",
      key: "client_id",
    },
  },
  refresh_key_client: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  device: {
    type: Sequelize.STRING,
    allowNull: false,
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
ClientTable.hasMany(AccsessDevice, {
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
app.post("/api/SignInOrRegistration", async (req, res) => {
  let values = req.body;

  const phoneNumber = values.phone_number;
  if (await verifyPhoneNumber(phoneNumber)) {
    const signIn = await ClientTable.findOne({
      raw: true,
      where: { client_phone_number: values.phone_number },
    });
    console.log("регистрация или вход");

    if (signIn) {
      res.status(200).json("sign");
    } else {
      res.status(200).json("reg");
    }
  } else {
    res.status(406).json("Некорректный номер телефона");
  }
});
// --------------------------------------------------------------регистрация или вход ---------------------------
// --------------------------------------------------------------вход авторизация---------------------------
app.post("/api/signIn", async (req, res) => {
  let values = req.body;
  const phoneNumber = values.phone_number;
  const deviceInfo2 =
    detector.detect(req.headers["user-agent"]).device.type +
    " " +
    detector.detect(req.headers["user-agent"]).client.family +
    " " +
    detector.detect(req.headers["user-agent"]).client.version;

  if (await verifyPhoneNumber(phoneNumber)) {
    const signIn2 = await ClientTable.findOne({
      raw: true,
      attributes: ["client_id", "client_password", "client_fio", "client_role"],
      where: { client_phone_number: values.phone_number },
    }).catch((err) => {
      console.log(
        "----------------------Ошибка авторизации------------------------------- "
      );
      console.log(err);
      res.status(406).json("Ошибка авторизации");
    });

    bcrypt.compare(
      values.password,
      signIn2.client_password,
      async function (error, result) {
        if (result) {
          const refreshKey = await addRefrefreshDB(signIn2, deviceInfo2);

          console.log("вход выполнен");

          res.status(200).json(refreshKey);
        } else {
          console.log(error);
          res.status(403).json("Неверный пароль");
        }
      }
    );
  } else {
    res.status(406).json("Некорректный номер телефона");
  }
});
// --------------------------------------------------------------вход авторизация---------------------------

// -------------------------------------------------------------- регистрация---------------------------
app.post("/api/registration", async (req, res) => {
  let values = req.body;

  const phoneNumber = values.phone_number;
  if (await verifyPhoneNumber(phoneNumber)) {
    const nameClientTrim =
      values.client_name !== undefined
        ? values.client_name.replace(/[^\p{L}]/gu, "").trim()
        : "";
    const surnameClientTrim =
      values.client_surname !== undefined
        ? values.client_surname.replace(/[^\p{L}]/gu, "").trim()
        : "";
    const patronymicClientTrim =
      values.client_patronymic !== undefined
        ? values.client_patronymic.replace(/[^\p{L}]/gu, "").trim()
        : "";

    const fioDB =
      surnameClientTrim +
      " " +
      nameClientTrim +
      (await (patronymicClientTrim !== undefined
        ? " " + patronymicClientTrim
        : ""));

    const email_client = await ClientTable.findOne({
      raw: true,
      where: { client_email: values.Email || null },
      attributes: ["client_email"],
    });
    console.log(values, " пришли от клиента ----------------");
    console.log(email_client?.client_email, " пришли от базы ----------------");
    console.log(values, " пришли от клиента ----------------");
    if (
      email_client?.client_email !== values.Email ||
      values.Email === undefined
    ) {
      ClientTable.create({
        client_phone_number: values.phone_number,
        client_password: bcrypt.hashSync(values.client_password, salt),
        client_name: values.client_name.replace(/[^\p{L}]/gu, "").trim(),
        client_patronymic: patronymicClientTrim,
        client_surname: values.client_surname.replace(/[^\p{L}]/gu, "").trim(),
        client_fio: fioDB,
        client_birthday:
          values.client_birthday &&
          dayjs(values.client_birthday).format("YYYY-MM-DD"),
        client_email: values.Email,
        client_job:
          values.client_job &&
          values.client_job.replace("тренер студии", "тренер"),
        client_illness: values.client_illness,
        client_messenger:
          (values.client_messenger || []).join() || "noMessengers",
      })
        .then(async (data) => {
          console.log("Регистрация успешна");
          const user = data.dataValues;
          console.log(user, "данные регистрации");
          const deviceInfo2 =
          detector.detect(req.headers["user-agent"]).device.type +
          " " +
          detector.detect(req.headers["user-agent"]).client.family +
          " " +
          detector.detect(req.headers["user-agent"]).client.version;
          const refreshKey = await addRefrefreshDB(user, deviceInfo2);
          // const result = await generateFreshforDB(user);

          res.status(200).json(refreshKey);
        })
        .catch((err) => {
          console.log(
            "----------------------Ошибка регистарции------------------------------- "
          );
          console.log(err);
          res
            .status(406)
            .json("Не удалось зарегистрировать. Проверьте корректность данных");
        });
    } else {
      console.log("Email занят");
      res.status(406).json("Email занят");
    }
  } else {
    res.status(406).json("Некорректный номер телефона");
  }
});
// --------------------------------------------------------------регистрация---------------------------

// --------------------------------------------------------------запрос тренировок ---------------------------
app.get("/api/activities", async (req, res) => {
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
app.post("/api/date_activity", async (req, res) => {
  let values = req.body;
  let dateSelect = dayjs(values.data);

  if (dayjs.isDayjs(dateSelect)) {
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
    await trainVisiters(sport);

    res.status(200).json(sport);

    console.log("отправил расписание");
  } else {
    res.status(200).json(null);
  }
});
// --------------------------------------------------------------отобразить тренировки по дате ---------------------------
// --------------------------------------------------------------запрос типов тренировки ---------------------------
app.get("/api/workout_list", async (req, res) => {
  const workout = await ActivityTypesTable.findAll({
    raw: true,
    logging: false,
    attributes: ["workout_id", "type_of_workout", "description_of_workout"],
  });

  res.status(200).json(workout);
});
// --------------------------------------------------------------запрос типов тренировки ----------------------
// --------------------------------------------------------------запрос всех тренеров ---------------------------
app.get("/api/coaches_list", async (req, res) => {
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
// --------------------------------------------------------------Восстановление профиля---------------------------
app.post("/api/restore_profile", async (req, res) => {
  let values = req.body;

  const email = await ClientTable.findOne({
    raw: true,
    where: { client_email: values.email },
    attributes: ["client_email", "client_id"],
  });

  if (email) {
    res.status(200).json(email.client_email);
    const randomstring = Math.random().toString(36).slice(-8);
    await sendRestoreMail(email, randomstring);
    await ClientTable.update(
      {
        client_restore: bcrypt.hashSync(randomstring, salt),
      },
      {
        where: {
          client_id: email.client_id,
        },
      }
    ).catch((err) => console.log("restore profile      --- ", err));
  } else {
    res.status(403).json("reg");
  }
});
// --------------------------------------------------------------Восстановление профиля ---------------------------

// --------------------------------------------------------------Восстановление профиля, сверка кода восстановления ---------------------------
app.post("/api/verify_code", async (req, res) => {
  let values = req.body;
  const verifyCode = values.verifyCode.trim();
  const email = await ClientTable.findOne({
    raw: true,
    where: { client_email: values.email },
    attributes: ["client_email", "client_restore"],
  });

  bcrypt.compare(
    verifyCode,
    email.client_restore,
    async function (error, result) {
      if (result) {
        console.log("код верный");
        res.status(200).json("Восстанавливаем пароль");
      } else {
        console.log(error);
        res.status(403).json("Неверный код");
      }
    }
  );
});
// --------------------------------------------------------------Восстановление профиля, сверка кода восстановления ---------------------------
// --------------------------------------------------------------восстановить пароль пользовтеля ---------------------------
app.put("/api/restore_password", async (req, res) => {
  let values = req.body;

  await ClientTable.update(
    {
      client_password: bcrypt.hashSync(values.client_password, salt),
      client_restore: null,
    },
    {
      where: {
        client_email: values.client_email,
      },
    }
  ).catch((err) => console.log("change password    --- ", err));

  res.status(200).json("Успешно");
});
// --------------------------------------------------------------восстановить пароль пользовтеля ---------------------------
// ----------------------------------------------------------- прослойка для аутентификации----------------
app.use(async function (req, res, next) {
  // console.log(req.get("Authorization").replace("Bearer ", ""), typeof(req.get("Authorization").replace("Bearer ", "")), "заголовок с токенами")
  // // console.log(req.get("Authorization").replace("Bearer ", "") === "null", "да?")
  let tokens = JSON.parse(req.get("Authorization").replace("Bearer ", ""));
  const deviceInfo2 =
  detector.detect(req.headers["user-agent"]).device.type +
  " " +
  detector.detect(req.headers["user-agent"]).client.family +
  " " +
  detector.detect(req.headers["user-agent"]).client.version;

  if (!tokens) {
    return res.status(404).end();
  }

  if (verifyAccessToken(tokens.token).success) {
    foreignId = verifyAccessToken(tokens.token).data.id;
    console.log("первый этап");
    next();
  } else if (await accessToNewRefresh2(tokens.refreshToken)) {

    const tokensSend = await refreshRefreshTokenDB(tokens.refreshToken, deviceInfo2);

    res.status(401).json(tokensSend).end();

    console.log("Второй этап");
    // next();
  } else {
    console.log("Третий этап");
    res.status(403).json("необходим перелогин");
  }
});
// ----------------------------------------------------------- прослойка для аутентификации----------------

// --------------------------------------------------------------создать тренировку ---------------------------
app.post("/api/add_activity", async (req, res) => {
  let values = req.body;
  // console.log(values);
  let flagParams = true;
  for (let params in values) {
    // console.log(values[params]);
    if (values[params] === null) {
      console.log(values[params]);
      flagParams = false;
      break;
    }
  }
  if (!flagParams) {
    console.log("Некореектные данные тренировки");
    res.status(404).json("Проверьте данные тренировки");
  } else if (
    !dayjs(values.start_time_train).isValid() ||
    !dayjs(values.end_time_train).isValid()
  ) {
    console.log("Некорректное время");
    res.status(404).json("Проверьте данные тренировки");
  } else if (
    dayjs(values.start_time_train).add(15, "minute") >
    dayjs(values.end_time_train)
  ) {
    console.log("Некорректное время старт<конца");
    res.status(404).json("Проверьте данные тренировки");
  } else {
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

    await ActivityTable.create({
      type_of_training: values.type_of_training,
      occupancy_train: parseInt(values.occupancy_train),
      start_time_train: start_time,
      end_time_train: end_time,
      description_of_train: description.description_of_workout
        .replace(/\s+/g, " ")
        .trim(),
      //concatinated_time: `${dayjs(values.time[0]).format('HH:mm')} - ${dayjs(values.time[1]).format('HH:mm')}`,
      weekday_train: dayjs(values.weekday_train).format("YYYY-MM-DD"),
      client_id: foreignId,
      coach_train: await createFIO(foreignId),
    }).catch((err) => console.log(err));

    const sport = await getTrainsByDay(
      dayjs(values.weekday_train).format("YYYY-MM-DD")
    );
    res.status(200).json(sport);
    console.log("создал тренировку и отправил");
    if (!req.body) return res.status(400).json("node node");
  }
});
// --------------------------------------------------------------создать тренировку ---------------------------
// --------------------------------------------------------------удаление тренировки ---------------------------
app.delete("/api/delete_activity", async (req, res) => {
  let values = req.body.training_id;
  let delDate = req.body.date;

  await ActivityTable.destroy({
    where: {
      training_id: values,
    },
    individualHooks: true,
  }).catch((err) => console.log(err));

  const sport = await getTrainsByDay(delDate);
  console.log("=== удалил и отправил тренировки==");
  res.status(200).json(sport);
});
// --------------------------------------------------------------удаление тренировки ---------------------------
// --------------------------------------------------------------изменение тренировки ---------------------------
app.put("/api/update_activity", async (req, res) => {
  let values = req.body;

  let flagParams = true;
  for (let params in values) {
    // console.log(values[params]);
    if (values[params] === null) {
      console.log(values[params]);
      flagParams = false;
      break;
    }
  }
  if (!flagParams) {
    console.log("Некореектные данные тренировки");
    res.status(404).json("Проверьте данные тренировки");
  } else if (
    !dayjs(values.start_time_train).isValid() ||
    !dayjs(values.end_time_train).isValid()
  ) {
    console.log("Некорректное время");
    res.status(404).json("Проверьте данные тренировки");
  } else if (
    dayjs(values.start_time_train).add(15, "minute") >
    dayjs(values.end_time_train)
  ) {
    console.log("Некорректное время старт<конца");
    res.status(404).json("Проверьте данные тренировки");
  } else {
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

    const sport = await getTrainsByDay(values.date);
    res.status(200).json(sport);
    console.log("изменил тренировку и отправил");
  }
});
// --------------------------------------------------------------изменение тренировки ---------------------------

// --------------------------------------------------------------выход из аккаунта ---------------------------
app.get("/api/logout", async (req, res) => {
  console.log("Выход из аккаунта");
  let tokens = JSON.parse(req.get("Authorization").replace("Bearer ", ""));

  await AccsessDevice.update(
    { refresh_key_client: "logout" },
    {
      where: {
        refresh_key_client: tokens.refreshToken,
      },
    }
  )
    .then((data) => {
      console.log("logout ok");
      res.status(200).json("успех");
    })
    .catch((err) => console.log(err));

});
// --------------------------------------------------------------выход из аккаунта ---------------------------

// --------------------------------------------------------------добавление абонемента ---------------------------
app.put("/api/update_subscription", async (req, res) => {
  let value = req.body;
  console.log(value);
  
  const nowSubscription = await ClientTable.findOne({
    raw: true,
    logging: false,
    attributes: ["client_pass"],
    where: { client_id: value.client_id },
  });

  const addSubscription  = await ClientTable.update(
    {
      client_pass: Number(nowSubscription.client_pass + value.client_pass)
    },
    {
      where: { client_id: value.client_id },
    }
  ).catch((err) => console.log("add pass    --- ", err));


  const clientProfilePass = await ClientTable.findOne({
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
      "client_pass",
    ],
    where: { client_id: value.client_id },
  });
  

  res.status(200).json(clientProfilePass);
});
// --------------------------------------------------------------добавление абонемента ----------------------

// --------------------------------------------------------------запрос клиентов ---------------------------
app.get("/api/client_list", async (req, res) => {
  const clients = await ClientTable.findAll({
    raw: true,
    logging: false,
    order: [["client_fio", "ASC"]],
    where: { client_role: "client" },
  });

  res.status(200).json(clients);
});
// --------------------------------------------------------------запрос клиентов ----------------------
// --------------------------------------------------------------запрос тренеров ---------------------------
app.get("/api/coach_list", async (req, res) => {
  const coaches = await ClientTable.findAll({
    raw: true,
    logging: false,
    where: { client_role: "coach" },
  });

  res.status(200).json(coaches);
});
// --------------------------------------------------------------запрос тренеров ----------------------



// --------------------------------------------------------------сделать тренером ---------------------------
app.post("/api/create_coach", async (req, res) => {
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
app.delete("/api/delete_coach", async (req, res) => {
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
// --------------------------------------------------------------удаление клиента ---------------------------
app.delete("/api/delete_client", async (req, res) => {
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
      client_role: "client",
    },
    order: [["client_fio", "ASC"]],
  })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));
});
// --------------------------------------------------------------удаление клиента ---------------------

// --------------------------------------------------------------запись на тренировку---------------------------
app.post("/api/sign_up_train", async (req, res) => {
  let values = req.body;

  const train = await ActivityTable.findOne({
    raw: true,
    logging: false,
    attributes: ["type_of_training"],
    where: {  training_id: values.training_id },
  });

  if (train.type_of_training !== "Индивидуальная тренировка") {
      const nowSubscription = await ClientTable.findOne({
    raw: true,
    logging: false,
    attributes: ["client_pass"],
    where: { client_id: foreignId },
  });

  if (nowSubscription.client_pass > 0) {
    await ActivityAndClientTable.create({
      training_id: values.training_id,
      client_id: foreignId,
    });
  
    await ClientTable.update(
      {
        client_pass: Number(nowSubscription.client_pass - 1)
      },
      {
        where: { client_id: foreignId },
      }
    ).catch((err) => console.log("add pass -1   --- ", err));
    res.status(200).json("записан");

  } else {
    res.status(405).json("нет абонемента");
  }
  } else {

    await ActivityAndClientTable.create({
      training_id: values.training_id,
      client_id: foreignId,
    });
    
    res.status(200).json("записан");
  }

});
// --------------------------------------------------------------запись на тренировку ---------------------------
// --------------------------------------------------------------отпись от тренировки---------------------------
app.post("/api/unsign_up_train", async (req, res) => {
  let values = req.body;

  const train = await ActivityTable.findOne({
    raw: true,
    logging: false,
    attributes: ["type_of_training"],
    where: {  training_id: values.training_id },
  });

  if (train.type_of_training !== "Индивидуальная тренировка") {
      const nowSubscription = await ClientTable.findOne({
    raw: true,
    logging: false,
    attributes: ["client_pass"],
    where: { client_id: foreignId },
  });

    await ClientTable.update(
      {
        client_pass: Number(nowSubscription.client_pass + 1)
      },
      {
        where: { client_id: foreignId },
      }
    ).catch((err) => console.log("add pass +1   --- ", err));

    console.log("отписан");
    
  } 

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
app.post("/api/client_list_for_coach", async (req, res) => {
  const value = req.body.training_id;
  const list = await makeDifferente(value);

  res.status(200).json(list);
});
// --------------------------------------------------------------запрос клиентов для записи ----------------------
// --------------------------------------------------------------тренер записывает на тренировку  клиента--------------------------
app.post("/api/sign_up_train_coach", async (req, res) => {
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
app.post("/api/unsign_up_train_coach", async (req, res) => {
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
app.post("/api/add_workout", (req, res) => {
  let values = req.body;

  ActivityTypesTable.create({
    type_of_workout: values.type_of_workout.replace(/\s+/g, " ").trim(),
    description_of_workout: values.description_of_workout
      .replace(/\s+/g, " ")
      .trim(),
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
app.delete("/api/delete_workout_activity", async (req, res) => {
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
    .then(async (data) => {
      res.status(200).json(data);
    })
    .catch((err) => console.log(err));
});
// --------------------------------------------------------------удаление типа тренировки ---------------------------
// --------------------------------------------------------------изменение типа тренировки ---------------------------
app.put("/api/update_workout", async (req, res) => {
  let values = req.body;
  await ActivityTypesTable.update(
    {
      type_of_workout: values.type_of_workout.replace(/\s+/g, " ").trim(),
      description_of_workout: values.description_of_workout
        .replace(/\s+/g, " ")
        .trim(),
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
app.post("/api/profile", async (req, res) => {
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
      "client_pass"
    ],
    where: { client_id: id },
  });

  res.status(200).json(clientProfile);
});
// --------------------------------------------------------------запрос профиля пользователя ----------------------
// --------------------------------------------------------------запрос посещенных тренировок---------------------------
app.post("/api/visited_trains", async (req, res) => {
  let visited = [];
  let id = req.body;

  const visited_trains = await ActivityAndClientTable.findAll({
    raw: true,
    logging: false,
    attributes: ["training_id"],
    where: { client_id: id.client_id },
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
app.put("/api/update_profile", async (req, res) => {
  let values = req.body;

  const nameClientTrim =
    values.client_name !== null
      ? values.client_name.replace(/[^\p{L}]/gu, "").trim()
      : "";
  const surnameClientTrim =
    values.client_surname !== null
      ? values.client_surname.replace(/[^\p{L}]/gu, "").trim()
      : "";
  const patronymicClientTrim =
    values.client_patronymic !== null
      ? values.client_patronymic.replace(/[^\p{L}]/gu, "").trim()
      : "";

  const fioDB =
    surnameClientTrim +
    " " +
    nameClientTrim +
    (await (values.client_patronymic !== null
      ? " " + values.client_patronymic.replace(/[^\p{L}]/gu, "").trim()
      : ""));

  const reservedEmail = await ClientTable.findOne({
    raw: true,
    logging: false,
    attributes: ["client_email", "client_id"],
    where: { client_email: values.client_email },
  });
  const reservedNumberPhone = await ClientTable.findOne({
    raw: true,
    logging: false,
    attributes: ["client_phone_number", "client_id"],
    where: { client_phone_number: values.client_phone_number },
  });

  let uniquePhoneNumber;
  if (!reservedNumberPhone) {
    uniquePhoneNumber = true;
  } else if (reservedNumberPhone.client_id === values.client_id) {
    uniquePhoneNumber = true;
  } else {
    uniquePhoneNumber = false;
  }

  console.log(values.client_email);
  console.log(reservedEmail);
  let uniqueEmail;
  if (!reservedEmail) {
    console.log("мыло нуленое", reservedEmail);
    uniqueEmail = true;
  } else if (values.client_email === "") {
    console.log("удалил мыло из профиля");
    uniqueEmail = true;
  } else if (values.client_email === null) {
    console.log("мыло из профиля null");
    uniqueEmail = true;
  } else if (reservedEmail.client_id === values.client_id) {
    console.log("мыло принадлежит изменяющему");
    uniqueEmail = true;
  } else {
    uniqueEmail = false;
  }

  async function coachJob(id) {
    console.log(id, "что ломает и почему профессия");
    const job = await ClientTable.findOne({
      raw: true,
      logging: false,
      attributes: ["client_role"],
      where: { client_id: id.client_id },
    });

    if (job.client_role === "coach" || job.client_role === "super_coach") {
      return "тренер студии";
    } else {
      return id.client_job.replace("тренер студии", "тренер");
    }
  }

  if (!uniquePhoneNumber) {
    console.log("Номер уже зарегистрирован");
    res.status(406).json("Номер уже зарегистрирован");
  } else if (!uniqueEmail) {
    console.log("Email уже зарегистрирован");
    res.status(406).json("Email уже зарегистрирован");
    // } else if (!dayjs(values.client_birthday).isValid() && ) {
    //   console.log("Некорректная дата");
    //   res.status(406).json("Некорректная дата");
  } else {
    await ClientTable.update(
      {
        client_phone_number: values.client_phone_number,
        client_name: values.client_name.replace(/[^\p{L}]/gu, "").trim(),
        client_patronymic: patronymicClientTrim,
        client_surname: values.client_surname.replace(/[^\p{L}]/gu, "").trim(),
        client_birthday:
          values.client_birthday &&
          dayjs(values.client_birthday).isValid() &&
          dayjs(values.client_birthday).format("YYYY-MM-DD"),
        client_fio: fioDB,
        client_email: values.client_email,
        client_job: values.client_job ? await coachJob(values) : null,
        client_illness: values.client_illness,
      },
      {
        where: {
          client_id: values.client_id,
        },
      }
    ).catch((err) => {
      // console.log("ediiiiiiiiit      --- ", err)
      console.log("Произошла ошибка обновления данных");
      res.status(406).json("Произошла ошибка обновления данных");
    });

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

    res.status(200).json(clientProfile);
  }
});

// --------------------------------------------------------------изменение профиля пользовтеля ---------------------------
// --------------------------------------------------------------изменение пароль пользовтеля ---------------------------
app.put("/api/update_password", async (req, res) => {
  let values = req.body;
  console.log(values, "--------------------old new pass");

  const oldPassword = await ClientTable.findOne({
    raw: true,
    where: { client_id: values.client_id },
    attributes: ["client_password"],
  }).catch((err) => {
    console.log(
      "----------------------Ошибка изменения пароля ------------------------------- "
    );
    console.log(err);
    res.status(406).json("Ошибка изменения пароля");
  });
  console.log(values.client_password, "новый пароль");
  console.log(oldPassword.client_password, "страый пароль");
  bcrypt.compare(
    values.old_client_password,
    oldPassword.client_password,
    async function (error, result) {
      console.log(result);
      console.log(error);
      if (result) {
        await ClientTable.update(
          {
            client_password: bcrypt.hashSync(values.client_password, salt),
          },
          {
            where: {
              client_id: values.client_id,
            },
          }
        ).catch((err) => console.log("change password    --- ", err));
        console.log("Пароль успешно обновлен");
        res.status(200).json("Успешно");
      } else {
        console.log(error);
        res.status(403).json("Неверный пароль");
      }
    }
  );
});
// --------------------------------------------------------------изменение пароль пользовтеля ---------------------------
// --------------------------------------------------------------функция вывода клиентов и записавшихся клиентов---------------------------
async function makeDifferente(training_id) {
  let recorded_clients = [];
  const recorded_client = await ActivityAndClientTable.findAll({
    raw: true,
    logging: false,
    attributes: ["client_id"],
    where: { training_id: training_id },
  });

  for (const client of recorded_client) {
    const clientFio = await ClientTable.findOne({
      raw: true,
      logging: false,
      attributes: ["client_fio", "client_id"],
      where: { client_id: client.client_id },
    });
    console.log(
      clientFio,
      "------------------------- clients-------------------"
    );
    recorded_clients.push(clientFio);
  }

  const clients = await ClientTable.findAll({
    raw: true,
    logging: false,
    where: { client_role: "client" },
    attributes: ["client_fio", "client_id"],
    order: [["client_fio", "ASC"]],
  });

  let difference = clients.filter(
    (person_A) =>
      !recorded_clients.some(
        (person_B) => person_A.client_id === person_B.client_id
      )
  );

  const recordAndDifference = {
    recorded: recorded_clients,
    difference: difference,
  };
  return recordAndDifference;
}
// --------------------------------------------------------------функция вывода клиентов и записавшихся клиентов----------------------
// -------------------------------------------------------------- регистрация пробников---------------------------
app.get("/api/registration_probnik", async (req, res) => {
  let currentProbnik = await ClientTable.findAll({
    raw: true,
    logging: false,
    where: { client_job: "Пробник" },
    attributes: ["client_job"],
  });

  if (currentProbnik.length <= 10) {
    const num = 2;
    const newProbnik = currentProbnik.length + num;
    for (i = currentProbnik.length + 1; i <= newProbnik; i++) {
      const nomer = i.toString();
      const kolvo = nomer.length;
      const probnik = {
        phone_number: "+7(000)-000-00-00".slice(0, 17 - kolvo) + i,
        client_password: nomer.repeat(4).slice(0, 4),
        client_name: "Пробник",
        client_surname: nomer,
        client_fio: "Пробник" + " " + i,
        client_job: "Пробник",
      };

      ClientTable.create({
        client_phone_number: probnik.phone_number,
        client_password: bcrypt.hashSync(probnik.client_password, salt),
        client_name: probnik.client_name,
        client_surname: probnik.client_surname,
        client_fio: probnik.client_fio,
        client_job: probnik.client_job,
        client_birthday: dayjs().format("YYYY-MM-DD"),
      })
        .then(async (data) => {
          console.log("Регистрация успешна");
        })
        .catch((err) => {
          console.log(
            "----------------------Ошибка регистарции------------------------------- "
          );
          console.log(err);
        });
    }
    res.status(200).json("Пробник создан");
  } else {
    res.status(400).json("Предельное количество пробных профилей");
  }
});
// --------------------------------------------------------------регистрация пробников---------------------------
// начинаем прослушивание подключений на 3000 порту

app.listen(3500, function () {
  console.log("Сервер начал принимать запросы по адресу http://localhost:3500");
});

secret = "ivan";

async function generateAccessToken(user) {
  const payload = {
    id: user.client_id,
    name: user.client_fio,
    role: user.client_role,
  };

  const options = { expiresIn: "10m" };

  return jwt.sign(payload, process.env.secretJWTaccess, options);
}

// ----------------------------------------------- генерация рефреш токена ----------------------
function generateRefreshToken(value) {
  const payload = {
    id: value,
  };

  const options = { expiresIn: "30d" };

  return jwt.sign(payload, process.env.secretJWTrefresh, options);
}
// ----------------------------------------------- генерация рефреш токена ----------------------

// ------------------------------------------------------ верификация аксес токенов ------------------------
function verifyAccessToken(token) {
  secret = "ivan";

  try {
    const decoded = jwt.verify(token, process.env.secretJWTaccess);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
// ------------------------------------------------------ верификация аксес токенов ------------------------

// ------------------------------------------------------ верификация рефреш токенов ------------------------
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.secretJWTrefresh);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
// ------------------------------------------------------ верификация рефреш токенов ------------------------

// ---------------------------------------- добавление рефреша в базу -----------------------------------
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
}
// ---------------------------------------- добавление рефреша в базу -----------------------------------

// ------------------------------------------- обновление токена в базе-----------------------------------
async function refreshRefreshTokenDB(reToken, device) {
  let reId = await verifyRefreshToken(reToken).data.id;
  let user = await findRefreshInDB2(reToken);

  if (reToken === user.refresh_key_client) {
    return await addRefrefreshDB(user, device);
  }
}
// ------------------------------------------- обновление токена в базе-----------------------------------


// --------------------------------------------- разрешение для генерации нового рефреш токена --------------------------------------------
// -------------------------------------------- распарсил токен, ищу владельца токена в базе и сравниваю токен в базе с пришедшим токеном------------------------------  ДЛЯ НОВОЙ БАЗЫ
async function accessToNewRefresh2(reToken) {

  let verifiedToken = await verifyRefreshToken(reToken).success;

  if (verifiedToken === false) {
    console.log("верефикация не прошла");
    return false;
  }
  let refreshFromDB = await findRefreshInDB2(reToken);

  if (refreshFromDB) {
    if (refreshFromDB.refresh_key_client === reToken) {
      console.log("токены совпали");
    } else {
      console.log("токены не совпали");
    }
  }else {
    console.log("В базе нет рефреш токена");
    
    return false
  }
  console.log("проверка токена пройдена");
  return refreshFromDB.refresh_key_client === reToken;
}
// -------------------------------------------- распарсил токен и ищу владельца токена в базе ------------------------------ ДЛЯ НОВОЙ БАЗЫ
// --------------------------------------------- разрешение для генерации нового рефреш токена --------------------------------------------

// ------------------2222222222222----------------------- поиск токена в базе -------------------00000000----------- ДЛЯ НОВОЙ БАЗЫ
async function findRefreshInDB2(refreshToken) {
  let reTokenDB2 = await AccsessDevice.findOne({
    raw: true,
    where: { refresh_key_client: refreshToken },
    logging: false,
  }).catch((err) =>
    console.log("-------------------------find Refresh--- ", err)
  );

  return reTokenDB2;
}
// ------------------2222222222222---------------------- поиск токена в базе -------------------00000000----------- ДЛЯ НОВОЙ БАЗЫ

// ------------- добавление рефреша в базу при входе или регистрации -------------------
async function addRefrefreshDB(user, deviceInfo) {
  let refreshKey = await generateRefreshToken(user.client_id);
  console.log("рефреш при входе или регистрации");
  // console.log(user.client_id, refresh.refreshToken, deviceInfo, "----тут добавляю в базу");
  const isSignUp = await AccsessDevice.findAll({
    raw: true,
    where: { client_id: user.client_id, device: deviceInfo },
    logging: false,
  });

  if (!isSignUp[0]) {
    const addRefreshDB = await AccsessDevice.create(
      {
        client_id: user.client_id,
        device: deviceInfo,
        refresh_key_client: refreshKey,
      },
      {
        raw: true,
      }
    ).catch((err) =>
      console.log("---------проблема добавления токена--- ", err)
    );
    console.log("токен добавлен");

    try {
      const userAccess = {
        token: await generateAccessToken(user),
        refreshToken: addRefreshDB.dataValues.refresh_key_client,
      };

      return userAccess;
    } catch (error) {
      console.error("Error inserting data", error);
    }
  } else {
    const updateRefreshDB = await AccsessDevice.update(
      {
        refresh_key_client: refreshKey,
      },
      {
        where: {
          client_id: user.client_id,
          device: deviceInfo,
        },
        returning: true,
        plain: true,
        raw: true,
      }
    ).catch((err) =>
      console.log("------------проблема обнолвения токена--- ", err)
    );
    console.log("токен обновлен");

    try {
      const userAccess = {
        token: await generateAccessToken(user),
        refreshToken: updateRefreshDB[1].refresh_key_client,
      };

      return userAccess;
    } catch (error) {
      console.error("Error inserting data", error);
    }
  }
}
// ------- добавление рефреша в базу при входе или регистрации -------------------
// -------------------------------------------------------функция проверки статуса тренировки ----------------------------------------------
function setStatusTrain(start, end) {
  if (dayjs() > dayjs(end)) {
    return "тренировка завершена";
  } else if (dayjs() < dayjs(start)) {
    return "тренировка запланирована";
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
    element.recorded_client = [];
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
        attributes: ["client_id"],
        where: { client_id: client.client_id },
      });
      train.recorded_client.push(fioForTrain.client_id);
    }
  }
}
// ------------------------------------функция добавления записанных клиентов к тренировкам -----------------------------------------
async function createFIO(id) {
  const user = await ClientTable.findOne({
    raw: true,
    where: { client_id: id },
  });

  return user.client_fio;
}

async function getTrainsByDay(date) {
  const sport = await ActivityTable.findAll({
    raw: true,
    order: [
      // массив для сортировки начинается с модели
      // затем следует название поля и порядок сортировки
      ["start_time_train", "ASC"],
    ],
    where: {
      weekday_train: date,
    },
  });
  addStatusTrain(sport);
  await trainVisiters(sport);
  return sport;
}

// --------------------------------- функция отправики email-----------------------
async function sendRestoreMail(email, code) {
  console.log(email, code, "функция отправки мыла");
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "i.lukashuk.kodibosh@gmail.com",
      pass: "uizn tisv bvvu rvas",
    },
  });

  let result = await transporter.sendMail({
    from: '"Node js" <nodejs@example.com>',
    to: email.client_email,
    subject: "Message from Node js",
    text: `This message was sent from Node js server.
      Код восстановления: ${code}`,
    // html:
    //     `This <i>message</i> was sent from <strong>Node js</strong> server.${code}`,
  });
}
// --------------------------------- функция отправики email-----------------------
// -------------------------------- функция проверки и валидации номера телефона ------------------------------------
async function verifyPhoneNumber(phoneNum) {
  if (phoneNum) {
    const lengthPhoneNumber =
      phoneNum.length - phoneNum.replace(/\d/gm, "").length;
    const phoneNumberDigit = Number(phoneNum.replace(/[^0-9]/g, ""));

    if (lengthPhoneNumber !== 11 || !Number.isInteger(phoneNumberDigit)) {
      console.log("Некорректный номер телефона");
      return false;
    } else {
      return true;
    }
  } else {
    console.log("Не введен номер телефона");
    return false;
  }
}
// -------------------------------- функция проверки и валидации номера телефона ------------------------------------
