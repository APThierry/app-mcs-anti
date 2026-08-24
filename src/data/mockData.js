import { realStoresData, realCinemaMovies } from './realData';

export { realStoresData, realCinemaMovies };

export const initialUserData = null;

export const bannersData = [
  {
    id: 1,
    title: "Monte Carmo Shopping",
    subtitle: "Tudo o que você precisa em compras, gastronomia e lazer em Betim!",
    tag: "Monte Carmo Oficial",
    badge: "Shopping",
    bgGradient: "linear-gradient(135deg, #059669 0%, #10B981 50%, #047857 100%)",
    image: "https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg",
    action: "Ver Lojas"
  },
  {
    id: 2,
    title: "Cineart Monte Carmo",
    subtitle: "Salas digitais com tecnologia de som e imagem de última geração!",
    tag: "Cinema & Lazer",
    badge: "Cineart Betim",
    bgGradient: "linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #4338CA 100%)",
    image: "https://sites.madnezz.com.br/api/site/upload/Banner/201907021221201.jpg",
    action: "Ver Sessões"
  },
  {
    id: 3,
    title: "Clube de Benefícios",
    subtitle: "Escaneie notas fiscais das lojas e troque por vantagens exclusivas!",
    tag: "Fidelidade",
    badge: "Ganhe Pontos",
    bgGradient: "linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #B45309 100%)",
    image: "https://sites.madnezz.com.br/api/site/upload/Banner/202605131356321.jpg",
    action: "Enviar Nota"
  }
];

export const storesData = realStoresData;

export const couponsData = [];

export const eventsData = [
  {
    id: 1,
    title: "Música na Praça - Monte Carmo",
    category: "Música & Cultura",
    date: "Todos os Sábados",
    time: "19:00 - 21:30",
    location: "Praça de Alimentação",
    description: "Apresentações musicais gratuitas para animar seu final de semana no Monte Carmo Shopping.",
    image: "https://sites.madnezz.com.br/api/site/upload/Banner/202212221200261.jpg"
  },
  {
    id: 2,
    title: "Espaço Kids & Diversão",
    category: "Infantil & Lazer",
    date: "Segunda a Domingo",
    time: "10:00 - 22:00",
    location: "Piso 2",
    description: "Atrações e muita diversão com monitores treinados para as crianças.",
    image: "https://sites.madnezz.com.br/api/site/upload/Banner/202504241119031.png"
  }
];

export const initialReceiptsData = [];

export const notificationsData = [
  {
    id: 1,
    title: "Bem-vindo ao Monte Carmo Shopping!",
    message: "Aproveite o Clube de Benefícios para acumular pontos em compras nas lojas do shopping.",
    time: "Hoje",
    read: false
  },
  {
    id: 2,
    title: "Cinema Cineart Monte Carmo",
    message: "Confira a programação completa e compre seus ingressos online.",
    time: "Hoje",
    read: false
  }
];
