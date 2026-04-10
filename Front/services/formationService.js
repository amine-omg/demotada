import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || 'https://demotada.onrender.com'}/api/formations`;

// Récupérer toutes les formations
export const getFormations = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Récupérer une formation par id
export const getFormationById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Créer une formation
export const createFormation = async (formationData) => {
  const response = await axios.post(API_URL, formationData);
  return response.data;
};

// Mettre à jour une formation
export const updateFormation = async (id, formationData) => {
  const response = await axios.put(`${API_URL}/${id}`, formationData);
  return response.data;
};

// Supprimer une formation
export const deleteFormation = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

import axios from "axios";
