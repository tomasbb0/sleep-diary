// Sleep Diary Questions - EXACTLY matching original paper form
// Maximum multiple choice for ease of use
const QUESTIONS = [
    // ==================== MANHÃ ====================
    {
        id: 'acordou',
        section: 'MANHÃ',
        title: 'A que horas acordou esta manhã?',
        type: 'time-picker'
    },
    {
        id: 'levantou',
        section: 'MANHÃ',
        title: 'A que horas se levantou da cama esta manhã?',
        type: 'time-picker'
    },
    {
        id: 'como_sente_manha',
        section: 'MANHÃ',
        title: 'Como se sente esta manhã?',
        type: 'choice',
        options: ['Muito mal', 'Mal', 'Razoavelmente', 'Bem', 'Muito bem']
    },
    
    // ==================== FATORES DIÁRIOS ====================
    {
        id: 'sestas',
        section: 'FATORES DIÁRIOS',
        title: 'Sestas durante o dia',
        type: 'choice',
        options: ['Não', 'Sim']
    },
    {
        id: 'sestas_duracao',
        section: 'FATORES DIÁRIOS',
        title: 'Se sim, duração:',
        type: 'choice',
        options: ['15 min', '30 min', '45 min', '1 hora', '1h30', '2 horas', '2h+'],
        condition: { field: 'sestas', value: 'Sim' }
    },
    {
        id: 'cafeina',
        section: 'FATORES DIÁRIOS',
        title: 'Ingestão de Cafeína (chás, cafés, etc)',
        subtitle: 'Tipo e quantidade',
        type: 'choice',
        options: ['Não bebi', '1 café/chá', '2 cafés/chás', '3 cafés/chás', '4 cafés/chás', '5+ cafés/chás']
    },
    {
        id: 'cafeina_ultima_hora',
        section: 'FATORES DIÁRIOS',
        title: 'Última hora de Consumo',
        type: 'time-picker',
        condition: { field: 'cafeina', value: (v) => v && v !== 'Não bebi' }
    },
    {
        id: 'atividade_fisica',
        section: 'FATORES DIÁRIOS',
        title: 'Atividade Física (tipo e duração)',
        type: 'choice',
        options: ['Nenhuma', 'Caminhada leve', 'Caminhada longa', 'Corrida', 'Ginásio', 'Bicicleta', 'Natação', 'Outro']
    },
    {
        id: 'atividade_fisica_duracao',
        section: 'FATORES DIÁRIOS',
        title: 'Duração da atividade física',
        type: 'choice',
        options: ['15 min', '30 min', '45 min', '1 hora', '1h30', '2 horas', '2h+'],
        condition: { field: 'atividade_fisica', value: (v) => v && v !== 'Nenhuma' }
    },
    
    // ==================== NOITE ====================
    {
        id: 'deitou',
        section: 'NOITE',
        title: 'A que horas se deitou na noite passada?',
        type: 'time-picker'
    },
    {
        id: 'tempo_adormecer',
        section: 'NOITE',
        title: 'Quanto tempo demorou a adormecer?',
        subtitle: '(em minutos)',
        type: 'choice',
        options: ['< 5 min', '5-10 min', '10-15 min', '15-30 min', '30-45 min', '45-60 min', '1-2 horas', '2+ horas']
    },
    {
        id: 'vezes_acordou',
        section: 'NOITE',
        title: 'Quantas vezes acordou durante a noite?',
        type: 'choice',
        options: ['0', '1', '2', '3', '4', '5+']
    },
    {
        id: 'despertares_oque',
        section: 'NOITE',
        title: 'O que fez durante os despertares noturnos?',
        type: 'choice-multi',
        options: ['Fui à casa de banho', 'Bebi água', 'Olhei o telemóvel', 'Fiquei na cama', 'Levantei-me', 'Comi algo', 'Outro'],
        condition: { field: 'vezes_acordou', value: (v) => v && v !== '0' }
    },
    {
        id: 'tempo_acordado_noite',
        section: 'NOITE',
        title: 'Quanto tempo esteve acordado durante a noite?',
        subtitle: '(total em minutos)',
        type: 'choice',
        options: ['< 5 min', '5-15 min', '15-30 min', '30-60 min', '1-2 horas', '2-3 horas', '3+ horas'],
        condition: { field: 'vezes_acordou', value: (v) => v && v !== '0' }
    },
    {
        id: 'sono_total',
        section: 'NOITE',
        title: 'Quanto tempo dormiu ao todo?',
        subtitle: '(em horas/minutos)',
        type: 'sleep-duration-picker'
    },
    {
        id: 'comprimidos',
        section: 'NOITE',
        title: 'Que comprimidos tomou para dormir na noite passada?',
        type: 'choice',
        options: ['Nenhum', 'Melatonina', 'Stilnox/Zolpidem', 'Valdispert', 'Outro']
    },
    {
        id: 'comprimidos_qtd',
        section: 'NOITE',
        title: 'Quantos comprimidos?',
        type: 'choice',
        options: ['1', '2', '3', '4+'],
        condition: { field: 'comprimidos', value: (v) => v && v !== 'Nenhum' }
    },
    {
        id: 'alcool',
        section: 'NOITE',
        title: 'Que quantidade de bebidas alcoólicas ingeriu na noite passada?',
        type: 'choice',
        options: ['Não bebi', '1-2 bebidas', '3-4 bebidas', '5-6 bebidas', '7+ bebidas']
    },
    {
        id: 'alcool_tipo',
        section: 'NOITE',
        title: 'Que tipo de bebidas?',
        type: 'choice-multi',
        options: ['Cerveja', 'Vinho', 'Shots', 'Cocktails', 'Whisky/Gin/Vodka', 'Outro'],
        condition: { field: 'alcool', value: (v) => v && v !== 'Não bebi' }
    },
    {
        id: 'qualidade_noite',
        section: 'NOITE',
        title: 'Como acha que passou a noite?',
        type: 'choice',
        options: ['Muito mal', 'Mal', 'Razoavelmente', 'Bem', 'Muito bem']
    }
];
