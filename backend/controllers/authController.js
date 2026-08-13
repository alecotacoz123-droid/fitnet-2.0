const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Follower, Notification } = require('../models');
const { logActivity } = require('../utils/logger');
const { createNotification } = require('../utils/notifier');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { username, email, password, full_name, role, bio } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash,
      full_name,
      role: role || 'user',
      bio: bio || '',
      preferences: {}
    });

    await logActivity(user.id, 'REGISTER', `Usuario registrado con rol: ${user.role}`, req);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'super_secret_fitnet_token_key_123',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        bio: user.bio,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor al registrar usuario.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      await logActivity(null, 'LOGIN_FAILED', `Intento de acceso fallido para el correo: ${email}`, req);
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await logActivity(user.id, 'LOGIN_FAILED', 'Contraseña incorrecta', req);
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'super_secret_fitnet_token_key_123',
      { expiresIn: '24h' }
    );

    await logActivity(user.id, 'LOGIN', 'Inicio de sesión exitoso', req);

    return res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        bio: user.bio,
        profile_picture: user.profile_picture,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
};

const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const { PasswordReset } = require('../models');

// Configure Nodemailer (Use your email credentials in .env or these defaults for local test)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@gmail.com',
    pass: process.env.EMAIL_PASS || 'password123'
  }
});

const recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'El correo electrónico es obligatorio.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      await logActivity(null, 'PASSWORD_RECOVERY_REQUEST', `Recuperación solicitada para correo no existente: ${email}`, req);
      return res.json({ message: 'Si el correo existe, se enviará un enlace de recuperación.' });
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 15 * 60000); // 15 mins

    await PasswordReset.destroy({ where: { email } }); // Clean old ones
    await PasswordReset.create({ email, code, expires_at });

    await logActivity(user.id, 'PASSWORD_RECOVERY_REQUEST', 'Solicitud de recuperación de contraseña generada', req);
    
    // Simulate or send email
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'tu_correo@gmail.com') {
        await transporter.sendMail({
          from: `"FitNet App" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Código de Recuperación de Contraseña - FitNet',
          html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                  <h2>Recuperación de Contraseña</h2>
                  <p>Hola ${user.full_name}, usa el siguiente código de 6 dígitos para restablecer tu contraseña:</p>
                  <h1 style="color: #d4ff3f; background: #000; padding: 10px; border-radius: 10px; display: inline-block;">${code}</h1>
                  <p>Este código expirará en 15 minutos.</p>
                </div>`
        });
        console.log(`[EMAIL] Código ${code} enviado a ${email}.`);
      } else {
        console.log(`\n=============================================`);
        console.log(`[SIMULACIÓN DE CORREO]`);
        console.log(`Para: ${email}`);
        console.log(`Tu código de recuperación es: ${code}`);
        console.log(`=============================================\n`);
      }
    } catch (mailError) {
      console.error('Nodemailer Error:', mailError);
    }

    return res.json({ message: 'Se ha enviado un código de 6 dígitos a tu correo electrónico.' });
  } catch (error) {
    console.error('Recover Password Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const resetRecord = await PasswordReset.findOne({ where: { email, code } });

    if (!resetRecord) {
      return res.status(400).json({ error: 'Código incorrecto o no encontrado.' });
    }

    if (new Date() > resetRecord.expires_at) {
      return res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo.' });
    }

    return res.json({ message: 'Código verificado con éxito.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error verificando el código.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, new_password } = req.body;
    const resetRecord = await PasswordReset.findOne({ where: { email, code } });

    if (!resetRecord || new Date() > resetRecord.expires_at) {
      return res.status(400).json({ error: 'Código inválido o expirado.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(new_password, salt);
    await user.save();

    // Clean up used code
    await resetRecord.destroy();
    await logActivity(user.id, 'PASSWORD_RESET', 'Contraseña restablecida correctamente', req);

    return res.json({ message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al restablecer la contraseña.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { full_name, bio, profile_picture, preferences, password } = req.body;
    
    const dbUser = await User.findByPk(req.user.id);
    if (!dbUser) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (full_name) dbUser.full_name = full_name;
    if (bio !== undefined) dbUser.bio = bio;
    
    if (req.file) {
      dbUser.profile_picture = `/uploads/${req.file.filename}`;
    } else if (profile_picture !== undefined) {
      dbUser.profile_picture = profile_picture;
    }
    
    if (preferences) {
      if (typeof preferences === 'string') {
        try {
          dbUser.preferences = JSON.parse(preferences);
        } catch (e) {
          dbUser.preferences = preferences;
        }
      } else {
        dbUser.preferences = preferences;
      }
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      dbUser.password_hash = await bcrypt.hash(password, salt);
    }

    await dbUser.save();
    await logActivity(dbUser.id, 'UPDATE_PROFILE', 'Perfil actualizado', req);

    return res.json({
      message: 'Perfil actualizado exitosamente.',
      user: {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        full_name: dbUser.full_name,
        role: dbUser.role,
        bio: dbUser.bio,
        profile_picture: dbUser.profile_picture,
        preferences: dbUser.preferences
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ error: 'Error al actualizar el perfil.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const followersCount = await Follower.count({ where: { following_id: user.id } });
    const followingCount = await Follower.count({ where: { follower_id: user.id } });

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      bio: user.bio,
      profile_picture: user.profile_picture,
      preferences: user.preferences,
      followersCount,
      followingCount
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ error: 'Error al obtener el perfil.' });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ 
      where: { username },
      attributes: ['id', 'username', 'full_name', 'role', 'bio', 'profile_picture', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const followersCount = await Follower.count({ where: { following_id: user.id } });
    const followingCount = await Follower.count({ where: { follower_id: user.id } });
    
    // Check if the authenticated user follows this user
    let isFollowing = false;
    if (req.user) {
      const followRecord = await Follower.findOne({
        where: { follower_id: req.user.id, following_id: user.id }
      });
      isFollowing = !!followRecord;
    }

    return res.json({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      bio: user.bio,
      profile_picture: user.profile_picture,
      created_at: user.created_at,
      followersCount,
      followingCount,
      isFollowing
    });
  } catch (error) {
    console.error('Get Public Profile Error:', error);
    return res.status(500).json({ error: 'Error al obtener el perfil público.' });
  }
};

const followUser = async (req, res) => {
  try {
    const { id: following_id } = req.params;
    const follower_id = req.user.id;

    if (follower_id === following_id) {
      return res.status(400).json({ error: 'No puedes seguirte a ti mismo.' });
    }

    const targetUser = await User.findByPk(following_id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Usuario a seguir no encontrado.' });
    }

    // Check if already following
    const existingFollow = await Follower.findOne({
      where: { follower_id, following_id }
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Ya sigues a este usuario.' });
    }

    await Follower.create({ follower_id, following_id });
    await logActivity(follower_id, 'FOLLOW_USER', `Siguió a usuario ID: ${following_id}`, req);
    await createNotification(following_id, follower_id, 'follow');

    return res.json({ message: 'Has comenzado a seguir a este usuario.' });
  } catch (error) {
    console.error('Follow Error:', error);
    return res.status(500).json({ error: 'Error al seguir al usuario.' });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { id: following_id } = req.params;
    const follower_id = req.user.id;

    const followRecord = await Follower.findOne({
      where: { follower_id, following_id }
    });

    if (!followRecord) {
      return res.status(400).json({ error: 'No sigues a este usuario.' });
    }

    await followRecord.destroy();
    await logActivity(follower_id, 'UNFOLLOW_USER', `Dejó de seguir a usuario ID: ${following_id}`, req);

    return res.json({ message: 'Has dejado de seguir a este usuario.' });
  } catch (error) {
    console.error('Unfollow Error:', error);
    return res.status(500).json({ error: 'Error al dejar de seguir al usuario.' });
  }
};

module.exports = {
  register,
  login,
  recoverPassword,
  updateProfile,
  getProfile,
  getPublicProfile,
  followUser,
  unfollowUser,
  verifyCode,
  resetPassword
};
