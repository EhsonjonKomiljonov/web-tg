import { readFile, writeFile } from '../utils/fs.js';
import jwt from 'jsonwebtoken';

export const userController = {
  GETMAIN: (req, res) => {
    try {
      const users = JSON.parse(readFile('/data/users.json')) || [];
      const images = JSON.parse(readFile('/data/images.json')) || [];

      const filtered = users.filter((item) => {
        item.images = [];

        for (let i of images) {
          if (i.user_id == item.id) {
            item.images.push(i);

            delete i.user_id;
          }
        }

        return item;
      });

      return res.send({
        status: 200,
        message: 'success',
        data: filtered,
      });
    } catch (err) {
      return res.send({
        status: 404,
        message: err.message,
        data: [],
      });
    }
  },
  GET: (req, res) => {
    try {
      const SECRET_KEY = process.env.SECRET_KEY;
      const users = JSON.parse(readFile('/data/users.json')) || [];
      const images = JSON.parse(readFile('/data/images.json')) || [];

      const getToken = jwt.verify(req.headers?.authorization, SECRET_KEY);

      const finder = users.find((item) => item.id == getToken?.id);

      if (!finder) {
        return res.send({
          status: 404,
          message: 'Not Found User',
          data: [],
        });
      }

      const filtered = [finder].filter((item) => {
        item.images = [];

        for (let i of images) {
          if (i.user_id == getToken.id) {
            item.images.push(i);

            delete i.user_id;
          }
        }

        return item;
      });

      return res.send({
        status: 200,
        message: 'success',
        data: filtered,
      });
    } catch (err) {
      return res.send({
        status: err.message == 'jwt must be provided' ? 401 : 404,
        message:
          err.message == 'jwt must be provided' ? 'Unauthorized' : err.message,
        data: [],
      });
    }
  },
  POST: (req, res) => {
    try {
      const SECRET_KEY = process.env.SECRET_KEY;
      const users = JSON.parse(readFile('/data/users.json')) || [];
      const images = JSON.parse(readFile('/data/images.json')) || [];

      const { user_name, email, password } = req.body;
      const { img_name } = req.files;

      images.push({
        id: images.at(-1)?.id + 1 || 1,
        img_name: '/' + img_name.md5 + img_name.name,
        size: img_name.size,
        type: img_name.mimetype,
        link: '/download/' + img_name.md5 + img_name.name,
        user_id: users.at(-1)?.id + 1 || 1,
      });

      const newUser = {
        id: users.at(-1)?.id + 1 || 1,
        user_name,
        email,
        password,
      };

      users.push(newUser);

      img_name.mv(process.cwd() + '/public/' + img_name.md5 + img_name.name);

      writeFile('/data/users.json', users);
      writeFile('/data/images.json', images);

      const token = jwt.sign(
        { id: newUser.id, user_name: newUser.user_name },
        SECRET_KEY
      );

      return res.send({
        status: 200,
        message: 'success',
        data: token,
      });
    } catch (err) {
      return res.send({
        status: 404,
        message: err.message,
        data: [],
      });
    }
  },
};
