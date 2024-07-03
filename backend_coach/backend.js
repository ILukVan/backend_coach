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
console.log(today, ",-----------------------todaaaaaay");
let foreignId
let role
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
    unique:true
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
  client_id: {
    type: Sequelize.UUID,
    references: {
      model: 'client_tables',
      key: 'client_id'
    }
  },

});


ClientTable.hasMany(ActivityTable, {foreignKey:'client_id', onDelete: "CASCADE", onUpdate: "CASCADE"})


sequelize
  .sync()
  .then((result) => {
    // параметр {force: true}, чтобы удалить таблицы и создать их заново, но уже с нужной нам структурой
  })
  .catch((err) => console.log(err));

// --------------------------------------------------------------регистрация или вход---------------------------
app.post("/SignInOrRegistration", async (req, res) => {
  let values = req.body;
  console.log(values);

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
        console.log(result);
        result.user = signIn2.client_id
        result.role = signIn2.client_role
        res.status(200).json(result);
      } else {
        console.log(error);
        res.status(200).json("nooooooooooooo");
      }
    }
  );
});
// --------------------------------------------------------------вход авторизация---------------------------
// -------------------------------------------------------------- регистрация---------------------------
app.post("/registration", async (req, res) => {
  let values = req.body;
  console.log(values);
  console.log(
    dayjs(values.client_birthday).format("YYYY-MM-DD"),
    "<------------------------------------------------------date B"
  );
  ClientTable.create({
    client_phone_number: values.phone_number,
    client_password: bcrypt.hashSync(values.client_password, salt),
    client_name: values.client_name,
    client_patronymic: values.client_patronymic,
    client_surname: values.client_surname,
    client_email: values.client_email,
    client_birthday: dayjs(values.client_birthday).format("YYYY-MM-DD"),
    client_job: values.client_job,
    client_illness: values.client_illness,
    client_messenger: values.client_messenger.join() || "noMessengers",

  })
    .then((data) => {
      console.log(data, "<---------успех");
      res.status(200).json("успех");
    })
    .catch((err) => res.send(406).json("неуспех"));
});
// --------------------------------------------------------------регистрация---------------------------

// ----------------------------------------------------------- прослойка для аутентификации----------------
app.use(async function (req, res, next) {

  let tokens =(JSON.parse((req.get("Authorization")).replace('Bearer ', '')));
  // console.log(tokens, "<------Tut?");


  if (!tokens) {

    return res.status(404).end();
  }

 

  if (verifyAccessToken(tokens.token).success) {

    foreignId=(verifyAccessToken(tokens.token).data).id;
    role=(verifyAccessToken(tokens.token).data).role;

    console.log("первый этап");
    next();
  } else if (await findRefreshDB(tokens.refreshToken)) {

    let newTokens = await refreshRefreshTokenDB(tokens.refreshToken);
    newTokens.user = foreignId;
    res.status(401).json(newTokens).end();
  
    console.log("Второй этап");
    // next();
  } else { 
    console.log("Третий этап");
    res.sendStatus(403)
  }
});
// ----------------------------------------------------------- прослойка для аутентификации----------------

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
  addStatusTrain(sport)
  res.status(200).json(sport);
});
// --------------------------------------------------------------запрос тренировок ---------------------------
// --------------------------------------------------------------создать тренировку ---------------------------
app.post("/add_activity", (req, res) => {
  let values = req.body;
  let start_time = dayjs(values.weekday_train).format("YYYY-MM-DD") + " " + dayjs(values.start_time_train).format("HH:mm");
  let end_time = dayjs(values.weekday_train).format("YYYY-MM-DD") + " " + dayjs(values.end_time_train).format("HH:mm");

  ActivityTable.create({
    type_of_training: values.type_of_training,
    occupancy_train: parseInt(values.occupancy_train),
    start_time_train: start_time,
    end_time_train: end_time,
    //concatinated_time: `${dayjs(values.time[0]).format('HH:mm')} - ${dayjs(values.time[1]).format('HH:mm')}`,
    weekday_train: dayjs(values.weekday_train).format("YYYY-MM-DD"),
    client_id: foreignId,
  }
)
    .then((data) => {
      console.log(data, "------------------------------create train");
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

  console.log(values, "<------------- edit");
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
  ).catch((err) => console.log("ediiiiiiiiit      --- ",err));

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
  console.log('Tut est cho?');
  const logout = await ClientTable.update(
    { refresh_key_client: 'logout' },
    {
      where: {
        client_id: foreignId,
      },
    },

  ).then((data) => {
    
    res.status(200).json("успех")
  })
  .catch((err) => console.log(err));


  
});
// --------------------------------------------------------------выход из аккаунта ---------------------------

// --------------------------------------------------------------отобразить тренировки по дате---------------------------
app.post("/date_activity", async (req, res) => {
  let values = req.body;
  let dateSelect = dayjs(values.data);
console.log(values);

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
   
    // sport.forEach(element => {
    //   console.log(element);
    //   let statusTrain = nowTime(element.start_time_train, element.end_time_train)
    //   element.status_train = statusTrain
    //   console.log(element);
    // });

    addStatusTrain(sport)
    
    res.status(200).json(sport);
  } else {
    res.status(200).json(null);
  }
});
// --------------------------------------------------------------отобразить тренировки по дате ---------------------------


// --------------------------------------------------------------запрос клиентов ---------------------------
app.get("/client_list", async (req, res) => {

  const clients = await ClientTable.findAll({
    raw: true,
    logging: false,
  });

  console.log("---------------------------client-------------- ",clients, "<-----------------------clients -------------------");
  res.status(200).json(clients);
});
// --------------------------------------------------------------запрос клиентов ----------------------
// --------------------------------------------------------------сделать тренером ---------------------------
app.post("/create_coach", async (req, res) => {
  let values = req.body;
  console.log(values);

  const newRole = await ClientTable.update(
    { client_role: 'coach' },
    {
      where: {
        client_id: values.client_id,
      },
    },

  ).then((data) => {
    
    res.status(200).json("успех")
  })
  .catch((err) => console.log(err));

  // const nowCoach = await ClientTable.findOne({
  //   raw: true,
  //   where: {  client_id: values.client_id },
  // });

  // console.log(nowCoach, "Б------------- теперь трпненр-------------------------");

  // Coach_table.create({
  //   coach_phone_number: nowCoach.client_phone_number,
  //   coach_name: nowCoach.client_name,
  //   coach_patronymic: nowCoach.client_patronymic,
  //   coach_surname: nowCoach.client_surname,
  //   coach_password: nowCoach.client_password,
  //   coach_email: nowCoach.client_email,
  //   coach_birthday: dayjs(nowCoach.client_birthday).format("YYYY-MM-DD"),

  // }).then((data) => {
  //   console.log("тренер создан");
  //   // res.status(200).json("успех")
  // })
  // .catch((err) => console.log(err));



});
// --------------------------------------------------------------сделать тренером  ---------------------------

// начинаем прослушивание подключений на 3000 порту
app.listen(3500, function () {
  console.log("Сервер начал принимать запросы по адресу http://localhost:3500");
});

function generateAccessToken(user) {
  const payload = {
    id: user.client_id,
    name: user.client_name,
    role: user.client_role
  };
  // console.log(payload, '<--- в генерации   access');
  const secret = "ivan";
  const options = { expiresIn: "5m" };

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
      token: generateAccessToken(user), 
      refreshToken: freshDB,
    }
    return userAccess;
  } catch (error) {
    console.error("Error inserting data", error);
  }

  // return userAccess;
}

async function refreshRefreshTokenDB(reToken) {

  let reId = await verifyRefreshToken(reToken).data.id;
  let user = await findRefreshInDB(reId);

console.log( user.refresh_key_client);
  if (reToken === user.refresh_key_client) {
    return await generateFreshforDB(user);
  }
}
async function findRefreshDB(reToken) {
  let reId = await verifyRefreshToken(reToken).data.id;
  let user = await findRefreshInDB(reId);
console.log( user, "530");
  if (user.refresh_key_client === reToken) {
    console.log("токены совпали");
  } else {
    console.log("не совпали");
  }
  return user.refresh_key_client === reToken;
}

async function findRefreshInDB(id) {
  console.log(id, "540");
  let user;
  let reTokenDB = await ClientTable.findOne({
    raw: true,
    where: { client_id: id },
    logging: false,
  }).catch((err) => console.log("-------------------------find Refresh      --- ",err));
  console.log(reTokenDB);
  try {
    user = reTokenDB;
  } catch (error) {
    console.error("Error inserting data", error);
    // return userAccess;
  }


// let user = results.rows[0];
  return user;
}


function setStatusTrain(start, end) {
  if (dayjs()>dayjs(end)) {
    return "тренировка завершина"
  } else if (dayjs()<dayjs(start)) {
  return "тренировка запланирова"
  } else {
    return "тренировка в процессе"
  }
  
}

function addStatusTrain(trains){

  trains.forEach(element => {

    let statusTrain = setStatusTrain(element.start_time_train, element.end_time_train)
    element.status_train = statusTrain
   
  });
  
}