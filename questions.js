// Questions configuration - matching your sleep diary exactly
const QUESTIONS = [
    // MANHÃ Section
    {
        id: 'acordou',
        section: 'MANHÃ',
        title: 'A que horas acordou esta manhã?',
        type: 'time',
        required: true
    },
    {
        id: 'levantou',
        section: 'MANHÃ',
        title: 'A que horas se levantou da cama?',
        type: 'time',
        required: true
    },
    {
        id: 'como_sente',
        section: 'MANHÃ',
        title: 'Como se sente esta manhã?',
        type: 'choice',
        options: ['Muito mal', 'Mal', 'Razoavelmente', 'Bem', 'Muito bem'],
        required: true
    },
    
    // FATORES DIÁRIOS Section
    {
        id: 'sestas',
        section: 'FATORES DIÁRIOS',
        title: 'Fez sestas ontem?',
        type: 'choice',
        options: ['Não', 'Sim'],
        required: true,
        followUp: 'sestas_detalhes'
    },
    {
        id: 'sestas_detalhes',
        section: 'FATORES DIÁRIOS',
        title: 'Detalhes das sestas',
        subtitle: 'Horas e duração (ex: 14h, 30min)',
        type: 'text',
        required: false,
        condition: { field: 'sestas', value: 'Sim' }
    },
    {
        id: 'cafeina',
        section: 'FATORES DIÁRIOS',
        title: 'Ingeriu cafeína ontem?',
        subtitle: 'Café, chá, etc.',
        type: 'choice',
        options: ['Não', 'Sim'],
        required: true,
        followUp: 'cafeina_detalhes'
    },
    {
        id: 'cafeina_detalhes',
        section: 'FATORES DIÁRIOS',
        title: 'Detalhes da cafeína',
        subtitle: 'Tipo, quantidade e última hora (ex: 2 bicas, última às 14h)',
        type: 'text',
        required: false,
        condition: { field: 'cafeina', value: 'Sim' }
    },
    {
        id: 'atividade_fisica',
        section: 'FATORES DIÁRIOS',
        title: 'Fez atividade física ontem?',
        type: 'choice',
        options: ['Não', 'Sim'],
        required: true,
        followUp: 'atividade_fisica_detalhes'
    },
    {
        id: 'atividade_fisica_detalhes',
        section: 'FATORES DIÁRIOS',
        title: 'Detalhes da atividade física',
        subtitle: 'Tipo e duração (ex: Caminhada 30min)',
        type: 'text',
        required: false,
        condition: { field: 'atividade_fisica', value: 'Sim' }
    },
    
    // NOITE Section
    {
        id: 'deitou',
        section: 'NOITE',
        title: 'A que horas se deitou ontem à noite?',
        type: 'time',
        required: true
    },
    {
        id: 'adormecer',
        section: 'NOITE',
        title: 'Quanto tempo demorou a adormecer?',
        type: 'choice',
        options: ['Imediato (< 5 min)', '5-15 minutos', '15-30 minutos', '30-60 minutos', 'Mais de 1 hora'],
        required: true
    },
    {
        id: 'acordou_noite',
        section: 'NOITE',
        title: 'Acordou durante a noite?',
        type: 'choice',
        options: ['Não', 'Sim, 1 vez', 'Sim, 2-3 vezes', 'Sim, mais de 3 vezes'],
        required: true
    },
    {
        id: 'acordou_noite_detalhes',
        section: 'NOITE',
        title: 'O que fez durante os despertares?',
        type: 'text',
        required: false,
        condition: { field: 'acordou_noite', value: (v) => v !== 'Não' }
    },
    {
        id: 'sono_total',
        section: 'NOITE',
        title: 'Quanto tempo dormiu no total?',
        subtitle: 'Estimativa em horas',
        type: 'choice',
        options: ['Menos de 4h', '4-5h', '5-6h', '6-7h', '7-8h', '8-9h', 'Mais de 9h'],
        required: true
    },
    {
        id: 'comprimidos',
        section: 'NOITE',
        title: 'Tomou comprimidos para dormir?',
        type: 'choice',
        options: ['Não', 'Sim'],
        required: true,
        followUp: 'comprimidos_detalhes'
    },
    {
        id: 'comprimidos_detalhes',
        section: 'NOITE',
        title: 'Quais e quantos?',
        type: 'text',
        required: false,
        condition: { field: 'comprimidos', value: 'Sim' }
    },
    {
        id: 'alcool',
        section: 'NOITE',
        title: 'Ingeriu bebidas alcoólicas ontem?',
        type: 'choice',
        options: ['Não', 'Sim'],
        required: true,
        followUp: 'alcool_detalhes'
    },
    {
        id: 'alcool_detalhes',
        section: 'NOITE',
        title: 'Detalhes do álcool',
        subtitle: 'Tipo e quantidade (ex: 2 cervejas)',
        type: 'text',
        required: false,
        condition: { field: 'alcool', value: 'Sim' }
    },
    {
        id: 'qualidade_noite',
        section: 'NOITE',
        title: 'Como acha que passou a noite?',
        type: 'choice',
        options: ['Muito mal', 'Mal', 'Razoavelmente', 'Bem', 'Muito bem'],
        required: true
    },
    {
        id: 'notas',
        section: 'NOTAS',
        title: 'Notas adicionais',
        subtitle: 'Algo mais que queira registar? (opcional)',
        type: 'text',
        required: false
    }
];
