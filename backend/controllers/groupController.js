const { Group, GroupMember, User, FitnessProfile } = require('../models');
const { logActivity } = require('../utils/logger');
const { createNotification } = require('../utils/notifier');

const createGroup = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const creator_id = req.user.id;
    if (!name || !category) return res.status(400).json({ error: 'El nombre y la categoría son obligatorios.' });
    const existingGroup = await Group.findOne({ where: { name } });
    if (existingGroup) return res.status(400).json({ error: 'Ya existe un grupo con este nombre.' });
    const group = await Group.create({ creator_id, name, description: description || '', category });
    await GroupMember.create({ group_id: group.id, user_id: creator_id, status: 'approved' });
    await logActivity(creator_id, 'CREATE_GROUP', `Grupo creado: ${group.name} (ID: ${group.id})`, req);
    return res.status(201).json({ message: 'Grupo creado exitosamente.', group });
  } catch (error) {
    console.error('Create Group Error:', error);
    return res.status(500).json({ error: 'Error interno al crear el grupo.' });
  }
};

const getGroups = async (req, res) => {
  try {
    const current_user_id = req.user.id;
    const groups = await Group.findAll({
      include: [
        { model: User, as: 'Creator', attributes: ['id', 'username', 'full_name', 'profile_picture', 'role'] },
        { model: GroupMember, attributes: ['user_id', 'status'] }
      ]
    });
    const formattedGroups = groups.map(group => {
      const groupJSON = group.toJSON();
      const members = groupJSON.GroupMembers || [];
      const membersCount = members.filter(m => m.status === 'approved').length;
      const userMemberRecord = members.find(m => m.user_id === current_user_id);
      const userJoinStatus = userMemberRecord ? userMemberRecord.status : 'not_joined';
      delete groupJSON.GroupMembers;
      return { ...groupJSON, membersCount, userJoinStatus };
    });
    return res.json(formattedGroups);
  } catch (error) {
    console.error('Get Groups Error:', error);
    return res.status(500).json({ error: 'Error al obtener los grupos.' });
  }
};

// Full group detail with ranking + stats (for Groups 2.0)
const getGroupDetail = async (req, res) => {
  try {
    const { id: group_id } = req.params;
    const requestingUserId = req.user.id;

    const group = await Group.findByPk(group_id, {
      include: [{ model: User, as: 'Creator', attributes: ['id', 'username', 'full_name', 'profile_picture'] }]
    });
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado.' });

    // Only members, creator, or admins can see detail
    const isAdmin = req.user.role === 'admin';
    const isCreator = group.creator_id === requestingUserId;
    const membership = await GroupMember.findOne({ where: { group_id, user_id: requestingUserId, status: 'approved' } });
    if (!isAdmin && !isCreator && !membership) {
      return res.status(403).json({ error: 'No eres miembro de este grupo.' });
    }

    const members = await GroupMember.findAll({
      where: { group_id, status: 'approved' },
      include: [{
        model: User,
        attributes: ['id', 'username', 'full_name', 'profile_picture'],
        include: [{ model: FitnessProfile, as: 'FitnessProfile', attributes: ['goal', 'current_streak', 'max_streak', 'total_workouts', 'weight_kg'] }]
      }]
    });

    const rankedMembers = members.map(m => {
      const fp = m.User?.FitnessProfile;
      const workouts = fp?.total_workouts || 0;
      const streak = fp?.current_streak || 0;
      const points = (workouts * 10) + (streak * 5);
      return {
        user_id: m.user_id,
        full_name: m.User?.full_name || 'Usuario',
        username: m.User?.username || '',
        profile_picture: m.User?.profile_picture || null,
        total_workouts: workouts,
        current_streak: streak,
        max_streak: fp?.max_streak || 0,
        weight_kg: fp?.weight_kg || null,
        goal: fp?.goal || null,
        points,
        hasProfile: !!fp
      };
    }).sort((a, b) => b.points - a.points);

    const totalWorkouts = rankedMembers.reduce((s, m) => s + m.total_workouts, 0);
    const totalCalories = totalWorkouts * 320;
    const avgStreak = rankedMembers.length > 0
      ? Math.round(rankedMembers.reduce((s, m) => s + m.current_streak, 0) / rankedMembers.length)
      : 0;
    const topStreak = rankedMembers.reduce((max, m) => Math.max(max, m.current_streak), 0);

    return res.json({
      group: { id: group.id, name: group.name, description: group.description, category: group.category, creator_id: group.creator_id, Creator: group.Creator, createdAt: group.createdAt },
      rankedMembers,
      stats: { totalMembers: rankedMembers.length, totalWorkouts, totalCalories, avgStreak, topStreak }
    });
  } catch (error) {
    console.error('Get Group Detail Error:', error);
    return res.status(500).json({ error: 'Error al obtener detalles del grupo.' });
  }
};

const requestJoinGroup = async (req, res) => {
  try {
    const { id: group_id } = req.params;
    const user_id = req.user.id;
    const group = await Group.findByPk(group_id);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado.' });
    const existingMember = await GroupMember.findOne({ where: { group_id, user_id } });
    if (existingMember) return res.status(400).json({ error: `Ya tienes una solicitud con estado: '${existingMember.status}' para este grupo.` });
    const membership = await GroupMember.create({ group_id, user_id, status: 'pending' });
    await logActivity(user_id, 'JOIN_GROUP_REQUEST', `Solicitud de unión al grupo: ${group.name}`, req);
    await createNotification(group.creator_id, user_id, 'group_join', null, group.id);
    return res.status(201).json({ message: 'Solicitud de unión enviada. Pendiente de aprobación.', membership });
  } catch (error) {
    console.error('Join Group Request Error:', error);
    return res.status(500).json({ error: 'Error al solicitar unirse al grupo.' });
  }
};

const manageMember = async (req, res) => {
  try {
    const { group_id, user_id } = req.params;
    const { status } = req.body;
    const creator_id = req.user.id;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Estado inválido.' });
    const group = await Group.findByPk(group_id);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado.' });
    if (group.creator_id !== creator_id && req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos.' });
    const membership = await GroupMember.findOne({ where: { group_id, user_id } });
    if (!membership) return res.status(404).json({ error: 'La solicitud de membresía no existe.' });
    membership.status = status;
    await membership.save();
    await logActivity(creator_id, 'MANAGE_GROUP_MEMBER', `Estado del miembro ${user_id} → ${status} en ${group.name}`, req);
    if (status === 'approved') await createNotification(user_id, creator_id, 'group_approve', null, group.id);
    return res.json({ message: `Solicitud actualizada a: '${status}'`, membership });
  } catch (error) {
    console.error('Manage Member Error:', error);
    return res.status(500).json({ error: 'Error al gestionar miembro del grupo.' });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const creator_id = req.user.id;
    const groups = await Group.findAll({ where: { creator_id } });
    const groupIds = groups.map(g => g.id);
    const pendingRequests = await GroupMember.findAll({
      where: { group_id: groupIds, status: 'pending' },
      include: [
        { model: Group, attributes: ['id', 'name', 'category'] },
        { model: User, attributes: ['id', 'username', 'full_name', 'profile_picture', 'role'] }
      ]
    });
    return res.json(pendingRequests);
  } catch (error) {
    console.error('Get Pending Requests Error:', error);
    return res.status(500).json({ error: 'Error al obtener solicitudes pendientes.' });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const creator_id = req.user.id;
    const groups = await Group.findAll({
      where: { creator_id },
      include: [{
        model: GroupMember,
        where: { status: 'approved' },
        required: false,
        include: [{
          model: User,
          attributes: ['id', 'username', 'full_name', 'profile_picture', 'role'],
          include: [{ model: FitnessProfile, as: 'FitnessProfile', attributes: ['goal', 'current_streak', 'max_streak', 'total_workouts', 'weight_kg'] }]
        }]
      }]
    });
    return res.json(groups);
  } catch (error) {
    console.error('Get My Groups Error:', error);
    return res.status(500).json({ error: 'Error al obtener tus grupos.' });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const { id: group_id } = req.params;
    const user_id = req.user.id;
    const membership = await GroupMember.findOne({ where: { group_id, user_id } });
    if (!membership) return res.status(404).json({ error: 'No perteneces a este grupo.' });
    await membership.destroy();
    return res.json({ message: 'Has salido del grupo correctamente.' });
  } catch (error) {
    console.error('Leave Group Error:', error);
    return res.status(500).json({ error: 'Error al salir del grupo.' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { group_id, user_id } = req.params;
    const creator_id = req.user.id;
    const group = await Group.findByPk(group_id);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado.' });
    if (group.creator_id !== creator_id && req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos.' });
    const membership = await GroupMember.findOne({ where: { group_id, user_id } });
    if (!membership) return res.status(404).json({ error: 'El usuario no pertenece al grupo.' });
    await membership.destroy();
    return res.json({ message: 'Miembro expulsado correctamente.' });
  } catch (error) {
    console.error('Remove Member Error:', error);
    return res.status(500).json({ error: 'Error al expulsar al miembro.' });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { id: group_id } = req.params;
    const creator_id = req.user.id;
    const group = await Group.findByPk(group_id);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado.' });
    if (group.creator_id !== creator_id && req.user.role !== 'admin') return res.status(403).json({ error: 'Sin permisos.' });
    await group.destroy();
    return res.json({ message: 'Grupo eliminado correctamente.' });
  } catch (error) {
    console.error('Delete Group Error:', error);
    return res.status(500).json({ error: 'Error al eliminar el grupo.' });
  }
};

module.exports = { createGroup, getGroups, getGroupDetail, requestJoinGroup, manageMember, getPendingRequests, getMyGroups, leaveGroup, removeMember, deleteGroup };
