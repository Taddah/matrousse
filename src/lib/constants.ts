export const strengthSuggestions = [
	// Savoir-être
	'Persévérant face à la difficulté',
	"Esprit de camaraderie et d'entraide",
	'Curiosité intellectuelle vive',
	"A l'écoute des conseils",
	'Force de proposition en groupe',

	// Savoir-faire (Méthodologie)
	'Grande autonomie dans les tâches',
	'Soin et rigueur dans le travail',
	'Capacité de concentration soutenue',
	"Sens de l'organisation exemplaire",
	"Réflexion avant l'action",

	// Académique
	'Excellente compréhension orale',
	'Richesse du vocabulaire',
	'Raisonnement logique solide',
	'Aisance dans les manipulations mathématiques',
	'Lecture fluide et expressive',
	'Bonne maîtrise des automatismes'
];

export const improvementSuggestions = [
	// Comportement / Posture
	'Gagner en confiance en soi',
	'Canaliser son énergie pour rester tâcheron',
	'Respecter le cadre et les règles de vie',
	'Apprendre à gérer ses émotions',
	'Limiter les interactions inutiles (bavardages)',

	// Méthodologie
	'Gagner en soin et en lisibilité (graphie)',
	'Prendre le temps de relire son travail',
	'Mieux organiser son matériel scolaire',
	'Approfondir le travail personnel à la maison',
	"Apprendre à demander de l'aide à bon escient",

	// Académique
	'Consolider les bases de la numération',
	'Automatiser la reconnaissance des mots',
	'Oser prendre la parole devant la classe',
	'Développer ses stratégies de mémorisation',
	"Améliorer la vitesse d'exécution des tâches"
];

export const COMPETENCIES = [
	{
		id: 'francais',
		name: 'Français',
		icon: '🇫🇷',
		color: 'blue',
		subCompetencies: [
			{ id: 'oral', name: 'Oral : S\'exprimer et écouter' },
			{ id: 'lecture', name: 'Lecture : Fluidité et compréhension' },
			{ id: 'ecriture', name: 'Écriture : Rédaction et graphisme' },
			{ id: 'langue', name: 'Langue : Grammaire, ortho, conjugaison' }
		]
	},
	{
		id: 'maths',
		name: 'Mathématiques',
		icon: '🔢',
		color: 'green',
		subCompetencies: [
			{ id: 'nombres', name: 'Nombres : Numération et calcul' },
			{ id: 'geometrie', name: 'Géométrie : Espace et figures' },
			{ id: 'mesures', name: 'Mesures : Grandeurs et unités' },
			{ id: 'problemes', name: 'Problèmes : Raisonner et résoudre' }
		]
	},
	{
		id: 'transversal',
		name: 'Transversal (Socle)',
		icon: '🧠',
		color: 'purple',
		subCompetencies: [
			{ id: 'autonomie', name: 'Autonomie : S\'organiser et chercher' },
			{ id: 'cooperation', name: 'Coopération : Travailler en groupe' },
			{ id: 'methode', name: 'Méthode : Soin et outils de travail' }
		]
	}
];
