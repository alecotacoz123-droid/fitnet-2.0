const axios = require('axios');
const { FitnessProfile, User } = require('../models');

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        
        let context = '';
        if (req.user) {
            const user = await User.findByPk(req.user.id);
            const profile = await FitnessProfile.findOne({ where: { user_id: req.user.id } });
            
            // Get today's calendar event
            const { CalendarEvent } = require('../models');
            const todayDate = new Date().toISOString().split('T')[0];
            const event = await CalendarEvent.findOne({ where: { user_id: req.user.id, date: todayDate } });
            
            let calendarContext = "No tiene entrenamiento programado para hoy.";
            if (event) {
              if (event.status === 'rest') calendarContext = "Hoy tiene día de descanso programado.";
              else calendarContext = `Hoy tiene programado: ${event.title}. Estado actual: ${event.status}.`;
            }

            if (user && profile) {
                context = `Nombre: ${user.full_name}. Objetivo: ${profile.goal}. ${calendarContext} Racha actual de entrenamientos: ${profile.current_streak} días. Entrenamientos totales este mes: ${profile.total_workouts}.`;
            }
        }

        // Connect to the AI Microservice running on port 5000
        const response = await axios.post('http://localhost:5000/chat', { message, context });
        
        res.json(response.data);
    } catch (error) {
        console.error("Chatbot Proxy Error:", error.message);
        res.status(500).json({ error: "No se pudo conectar con el microservicio de IA." });
    }
};
