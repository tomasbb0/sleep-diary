// Sleep Diary Questions - Matching original paper form exactly
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
        title: 'Sestas durante o dia?',
        type: 'choice',
        options: ['Não', 'Sim']
    },
    {
        id: 'sestas_duracao',
        section: 'FATORES DIÁRIOS',
        title: 'Duração da(s) sesta(s)',
        subtitle: 'Ex: 30min, 1h, etc.',
        type: 'text',
        condition: { field: 'sestas', value: 'Sim' }
    },
    {
        id: 'cafeina',
        section: 'FATORES DIÁRIOS',
        title: 'Ingestão de Cafeína (chás, cafés, etc)',
        subtitle: 'Tipo e quantidade. Ex: 2 bicas, 1 chá',
        type: 'text'
    },
    {
        id: 'cafeina_ultima_hora',
        section: 'FATORES DIÁRIOS',
        title: 'Última hora de consumo de cafeína',
        type: 'time-picker',
        condition: { field: 'cafeina', value: (v) => v && v.length > 0 }
    },
    {
        id: 'atividade_fisica',
        section: 'FATORES DIÁRIOS',
        title: 'Atividade Física',
        subtitle: 'Tipo e duração. Ex: Corrida 30min, Bicicleta 1h',
        type: 'text'
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
        subtitle: 'Em minutos',
        type: 'duration-picker'
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
        subtitle: 'Ex: fui à casa de banho, olhei o telemóvel, etc.',
        type: 'text',
        condition: { field: 'vezes_acordou', value: (v) => v && v !== '0' }
    },
    {
        id: 'tempo_acordado_noite',
        section: 'NOITE',
        title: 'Quanto tempo esteve acordado durante a noite?',
        subtitle: 'Total em minutos',
        type: 'duration-picker',
        condition: { field: 'vezes_acordou', value: (v) => v && v !== '0' }
    },
    {
        id: 'sono_total',
        section: 'NOITE',
        title: 'Quanto tempo dormiu ao todo?',
        subtitle: 'Em horas e minutos',
        type: 'sleep-duration-picker'
    },
    {
        id: 'comprimidos',
        section: 'NOITE',
        title: 'Tomou comprimidos para dormir?',
        type: 'choice',
        options: ['Não', 'Sim']
    },
    {
        id: 'comprimidos_quais',
        section: 'NOITE',
        title: 'Que comprimidos tomou? Quantos?',
        type: 'text',
        condition: { field: 'comprimidos', value: 'Sim' }
    },
    {
        id: 'alcool',
        section: 'NOITE',
        title: 'Bebidas alcoólicas na noite passada?',
        type: 'choice',
        options: ['Não bebi', '1-2 bebidas', '3-4 bebidas', '5+ bebidas']
    },
    {
        id: 'alcool_tipo',
        section: 'NOITE',
        title: 'Que bebidas?',
        subtitle: 'Ex: 2 cervejas, 1 copo de vinho',
        type: 'text',
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
