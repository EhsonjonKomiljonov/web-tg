import { readFile } from '../utils/fs.js'; 

export const userCheck = (req, res, next) => {
  const users = JSON.parse(readFile('/data/users.json')) || [];

  const { user_name, email, password } = req.body;
  const { img_name } = req.files;

  if (!user_name || !email || !password)
    return res.send({ status: 400, message: 'Incorrect values' });

  const findUsers = users.find(
    (item) =>
      item.user_name == user_name &&
      item.email == email &&
      item.password == password
  );

  if (findUsers)
    return res.send({
      status: 404,
      message: 'Bunday user mavjud!',
      data: [],
    });

  const findUserEmail = users.find((item) => item.email == email);

  if (findUserEmail)
    return res.send({
      status: 404,
      message: 'Bunday email lik user mavjud!',
      data: [],
    });

  if (user_name.trim().length === 0)
    return res.send({
      status: 404,
      message: 'User name xato',
      data: [],
    });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.trim().length === 0)
    return res.send({
      status: 404,
      message: "Email to'g'ri kiritilmagan!",
      data: [],
    });

  if (password.length < 6)
    return res.send({
      status: 404,
      message: "Password uzunligi 6 tadan ko'p bo'lishi lozim!",
      data: [],
    });

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password))
    return res.send({
      status: 404,
      message:
        "Passwordda kamida bitta katta xarf, kichik harf va raqam bo'lishi shart!",
      data: [],
    });

  // IMAGE CHECK

  if (!img_name)
    return res.send({
      status: 404,
      message: 'Incorrect Values',
    });

  if (
    img_name.mimetype != 'image/jpeg' &&
    img_name.mimetype != 'image/png' &&
    img_name.mimetype != 'image/svg' &&
    img_name.mimetype != 'image/webp'
  )
    return res.send({
      status: 404,
      message: 'Incorrect image type!',
    });

  if (img_name.truncated)
    return res.send({
      status: 404,
      message: 'Image size incorrect!',
    });

  next();
};
