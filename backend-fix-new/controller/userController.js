import User from '../model/user.js';
import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';


// ...existing code...
export function createUser(req, res) {
    if (req.body.role == "admin") {
        if (req.user != null) {
            if (req.user.role != "admin") {
                res.status(403).json({
                    message: "You are not authorized to create an admin accounts"
                });
                return;
            }
        } else {
            res.status(403).json({
                message: "You are not authorized to create an admin accounts. Please login first"
            });
            return;
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
        userId: req.body.userId,
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role
    });

    user.save().then(
        () => {
            res.json({
                message: "User created successfully"
            });
        }
    ).catch(
        () => {
            res.json({
                message: "Failed to create user"
            });
        }
    );
}
// ...existing code...
/*
export function createUser(req,res){
    if(req.body.role == "admin"){
        if(req.user!= null){
            if(req.user.role != "admin"){
                res.status(403).json({
                    message : "You are not authorized to create an admin accounts"
                })
                return
            }
        }else{
            res.status(403).json({
                message : "You are not authorized to create an admin accounts. Please login first"
            })
            return
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10)

    const user = new User({
        userId : req.body.userId,
        name : req.body.name,
        email : req.body.email,
        password : hashedPassword,
        role : req.body.role
    })


    user.save().then(
        ()=>{
            res.json({
                message : "User created successfully"
            })
        }
    ).catch(
        ()=>{
            res.json({
                message : "Failed to create user"
            })
        }
    )
}*/

export async function loginUser(req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;

        User.findOne({ email: email }).then((user) => {
            if (user == null) {
                console.log('user not found');
                res.status(401).json({
                    message: 'User not found'
                })

            }
            else {
                const isPasswordCorrect = bcrypt.compareSync(password, user.password);
                if (isPasswordCorrect) {
                    const token = jwt.sign({
                        userId: user.userId,
                        email: user.email,
                        role: user.role
                    }, "gate-pass-secret-key"
                    )
                    console.log('Login successful');
                    console.log(token);
                    res.status(200).json({
                        message: "Login successful",
                        token: token,
                        role: user.role
                    })
                }
                else {
                    console.log('Password is incorrect');
                    res.status(401).json({
                        message: "Password is incorrect"
                    })
                }
            }
        })
    }
    catch (err) {
        res.status(500).send({
            message: "Internal Server Error",
            error: err.message
        })
    }

}

export function isAdmin(req) {
    if (!req.user) return false;
    return req.user.role === 'admin';
}

