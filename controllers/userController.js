const ApiError = require("./../error/ApiError");
const bcrypt = require("bcrypt");
const { User, Basket } = require("./../models/models");
const jwt = require("jsonwebtoken");

const generateJwt = (id, email, role) =>
    jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
        expiresIn: "24h",
    });

class UserController {
    async registration(req, res, next) {
        const { email, password, role } = req.body;
        if (!email?.length || !password?.length) {
            return next(ApiError.badRequest("Некорректный email или пароль"));
        }

        const isAlreadySigned = await User.findOne({ where: { email } });

        if (isAlreadySigned) {
            next(ApiError.badRequest("Пользователь с таким email уже существует"));
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const user = await User.create({ email, password: hashPassword, role });
        const basket = await Basket.create({ userId: user.id });

        ////first arg {} - payload of token
        const token = generateJwt(user.id, user.email, user.role);
        return res.json({ token });
    }

    async login(req, res, next) {
        const { email, password } = req.body;
        const user = await User.findOne({
            where: {
                email,
            },
        });
        if (!user) {
            return next(ApiError.internalServer("User not found"));
        }

        let isPasswordEqual = bcrypt.compareSync(password, user.password);
        if (!isPasswordEqual) {
            return next(ApiError.internalServer("Incorrect email or password"));
        }
        const token = generateJwt(user.id, user.email, user.role);
        res.json({ token });
    }

    async check(req, res, next) {
        const { email, id, role } = req.user;
        const token = generateJwt(id, email, role);
        return res.json({ token });
    }
}

module.exports = new UserController();
