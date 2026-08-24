import { realStoresData, realCinemaMovies } from './realData';

export { realStoresData, realCinemaMovies };

export const initialUserData = {
  name: "Thierry Anthony Sousa Silva",
  email: "thierry.silva@email.com",
  phone: "(31) 98765-4321",
  cpf: "123.456.789-00",
  level: "Ouro",
  levelBadge: "👑",
  points: 1450,
  nextLevelPoints: 2000,
  nextLevelName: "Diamante",
  referralCode: "THIERRY2026",
  referralLink: "https://montecarmoshopping.com.br/cadastro?ref=THIERRY2026",
  totalInvited: 4,
  pointsFromReferrals: 400,
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
};

export const bannersData = [
  {
    id: 1,
    title: "Monte Carmo Shopping",
    subtitle: "Tudo o que você precisa em compras, gastronomia e lazer em Betim!",
    tag: "Monte Carmo Oficial",
    badge: "Shopping",
    bgGradient: "linear-gradient(135deg, #059669 0%, #10B981 50%, #047857 100%)",
    image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=600&auto=format&fit=crop&q=80",
    action: "Ver Lojas"
  },
  {
    id: 2,
    title: "Cineart Monte Carmo",
    subtitle: "Filmes em cartaz com salas digitais e som de última geração!",
    tag: "Cinema & Lazer",
    badge: "Cineart Betim",
    bgGradient: "linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #4338CA 100%)",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
    action: "Ver Sessões"
  },
  {
    id: 3,
    title: "Clube de Vantagens",
    subtitle: "Escaneie notas fiscais das lojas e troque por prêmios exclusivos!",
    tag: "Fidelidade",
    badge: "Ganhe Pontos",
    bgGradient: "linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #B45309 100%)",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
    action: "Enviar Nota"
  }
];

export const storesData = realStoresData.length > 0 ? realStoresData : [
  {
    id: "bk",
    name: "Burger King",
    category: "Alimentação",
    floor: "Praça de Alimentação",
    hours: "11:00 - 23:00",
    phone: "(31) 3117-1511",
    whatsapp: "553131171511",
    logo: "🍔",
    rating: 4.8,
    couponsCount: 2,
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&auto=format&fit=crop&q=80"
  }
];

export const couponsData = [];

export const eventsData = [
  {
    id: 1,
    title: "Música na Praça - Clássicos da MPB",
    category: "Música & Cultura",
    date: "Todos os Sábados",
    time: "19:00 - 21:30",
    location: "Praça de Alimentação",
    description: "Apresentações musicais gratuitas ao vivo para animar seu final de semana no Monte Carmo Shopping.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    title: "Espaço Kids & Air Jump",
    category: "Infantil & Lazer",
    date: "Segunda a Domingo",
    time: "10:00 - 22:00",
    location: "Piso 2",
    description: "Camas elásticas gigantes, piscina de bolinhas e muita diversão com monitores treinados.",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=500&auto=format&fit=crop&q=80"
  }
];

export const initialReceiptsData = [
  {
    id: "NF-123401",
    storeName: "ARTESANATO DO JAPA",
    amount: 145.00,
    pointsEarned: 145,
    date: "21/08/2026 - 10:15",
    status: "Aprovada",
    statusColor: "#10B981"
  },
  {
    id: "NF-123410",
    storeName: "BURGER KING",
    amount: 58.90,
    pointsEarned: 59,
    date: "19/08/2026 - 19:30",
    status: "Aprovada",
    statusColor: "#10B981"
  },
  {
    id: "NF-123408",
    storeName: "BoliXe Monte Carmo",
    amount: 190.00,
    pointsEarned: 190,
    date: "17/08/2026 - 21:00",
    status: "Aprovada",
    statusColor: "#10B981"
  }
];

export const notificationsData = [
  {
    id: 1,
    title: "Parabéns! Sua Nota Fiscal foi Aprovada",
    message: "Você ganhou +145 pontos referentes à sua compra no Artesanato do Japa.",
    time: "Há 15 min",
    read: false
  },
  {
    id: 2,
    title: "Cineart Monte Carmo",
    message: "Novos filmes adicionados à programação semanal!",
    time: "Hoje",
    read: false
  },
  {
    id: 3,
    title: "Amigo Cadastrado 🎉",
    message: "Lucas Gabriel utilizou seu link de indicação. +100 pontos adicionados!",
    time: "Ontem",
    read: true
  }
];
