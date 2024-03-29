const AppError = require('../utils/AppError')
const knex = require('../database/knex')
const {  hash, compare } = require('bcrypt')

class UsersController {
  async index(req, res){
    const users = await knex('users')
    return res.json(users)
  }

  async create(req, res){
      const { name, email, password } = req.body

      try{
        const checkUserExists = await knex('users')
        .where('email', email)
        .first()
  
        if(checkUserExists){
          throw new AppError('Este email já está em uso')
        }
    
        const hashedPassword = await hash(password, 8)
    
        await knex('users').insert({
          name: name,
          email: email,
          password: hashedPassword
        })
    
        return res.json(201).json()

      } catch(err){
        console.error(err)
        return res.status(500).json({ 
          error: err
        });
      }
    }

  async update(req, res){
    const { name, email, password, old_password } = req.body
    const user_id = req.user.id

    try{
      const [user] = await knex('users').where({id: user_id})

      if(!user){
        res.json("Usuário não encontrado")
      }

      if (email !== user.email) {
        const checkEmailExists = await knex('users')
          .where('email', email)
          .first();
      
        if (checkEmailExists) {
          throw new AppError('Este email já está em uso');
        }
      }
  
      user.name = name ?? user.name
      user.email = email ?? user.email

      if(name === '' || email === ''){
        throw new AppError('O usuário/email está vazio')
      }
  
      if(password && !old_password){
        throw new AppError("Você precisa informar a senha antiga para definir a nova senha")
      }
  
      if(password && old_password){
        if(password.length < 6){
          throw new AppError("A senha nova precisa ter pelo menos 6 dígitos")
        }

        const checkOldPassword = await compare(old_password, user.password)
  
        if(!checkOldPassword){
          throw new AppError("A senha não confere")
        }
  
        user.password = await hash(password, 8)
      }
  
      await knex('users')
      .where({id: user_id})
      .update({
        name: name,
        email: email,
        password: user.password,
        updated_at: knex.fn.now()
      })
  
      return res.json()
    } catch(error){
      console.error(error)
      throw new AppError(error.message)
    }
  }
}

module.exports = UsersController