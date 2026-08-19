export type Question = {
  q: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  fact: { label: string; value: string };
};

export type QuizDef = {
  code: string;
  name: string;
  subject: string;
  years: string;
  role: string;
  place: string;
  didYouKnow: string;
  works: string[];
  questions: Question[];
  by: string;
  niveau: string;
  langue: string;
  classId?: string;
  photo?: string;
};

// 8 built-in ready-made quizzes so the app has real content with zero setup —
// CURIE and HUGO are surfaced as the two "démo" quick-start chips on the
// student Quizz tab, matching the original app.
export const QUIZZES: Record<string, QuizDef> = {
  CURIE: {
    code: 'CURIE', name: 'Marie Curie', subject: 'Sciences',
    years: '1867 – 1934', role: 'Physicienne & chimiste', place: 'Varsovie, Pologne',
    didYouKnow: "Elle est la seule personne à avoir reçu deux prix Nobel dans deux sciences différentes.",
    works: ['Découverte du polonium', 'Découverte du radium', 'Théorie de la radioactivité'],
    by: 'Figures', niveau: '4e', langue: 'Français',
    questions: [
      { q: 'Dans quel pays Marie Curie est-elle née ?', options: ['France', 'Pologne', 'Russie', 'Autriche'], correct: 1, fact: { label: 'Pays natal', value: 'Pologne' } },
      { q: 'Combien de prix Nobel a-t-elle reçus ?', options: ['1', '2', '3', '0'], correct: 1, fact: { label: 'Prix Nobel', value: '2 (physique et chimie)' } },
      { q: 'Quel élément chimique a-t-elle découvert avec Pierre Curie ?', options: ['Oxygène', 'Uranium', 'Radium', 'Fer'], correct: 2, fact: { label: 'Découverte', value: 'Le radium' } },
      { q: 'Quel est son domaine de recherche principal ?', options: ['Astronomie', 'Radioactivité', 'Génétique', 'Botanique'], correct: 1, fact: { label: 'Domaine', value: 'La radioactivité' } },
      { q: "Dans quelle ville a-t-elle mené l'essentiel de sa carrière ?", options: ['Londres', 'Berlin', 'Paris', 'Varsovie'], correct: 2, fact: { label: 'Ville de carrière', value: 'Paris' } },
    ],
  },
  HUGO: {
    code: 'HUGO', name: 'Victor Hugo', subject: 'Littérature',
    years: '1802 – 1885', role: 'Écrivain & poète', place: 'Besançon, France',
    didYouKnow: "Il a été exilé politique pendant près de 20 ans, notamment sur l'île de Guernesey.",
    works: ['Les Misérables', 'Notre-Dame de Paris', 'Les Contemplations'],
    by: 'Figures', niveau: '4e', langue: 'Français',
    questions: [
      { q: 'Quel roman raconte l\'histoire de Jean Valjean ?', options: ['Notre-Dame de Paris', 'Les Misérables', 'Les Contemplations', 'Ruy Blas'], correct: 1, fact: { label: 'Roman célèbre', value: 'Les Misérables' } },
      { q: 'Quel mouvement littéraire Victor Hugo incarne-t-il ?', options: ['Le classicisme', 'Le romantisme', 'Le réalisme', 'Le surréalisme'], correct: 1, fact: { label: 'Mouvement', value: 'Le romantisme' } },
      { q: 'Dans quel roman trouve-t-on le personnage de Quasimodo ?', options: ['Notre-Dame de Paris', 'Les Misérables', 'Hernani', 'Ruy Blas'], correct: 0, fact: { label: 'Personnage', value: 'Quasimodo (Notre-Dame de Paris)' } },
      { q: 'Pourquoi Victor Hugo a-t-il vécu en exil ?', options: ['Raisons de santé', 'Opposition politique à Napoléon III', 'Etudes à l\'étranger', 'Raisons familiales'], correct: 1, fact: { label: 'Exil', value: "Opposition à Napoléon III" } },
      { q: 'Quel est le genre principal de son œuvre "Les Contemplations" ?', options: ['Roman', 'Poésie', 'Théâtre', 'Essai'], correct: 1, fact: { label: 'Genre', value: 'Recueil de poésie' } },
    ],
  },
  NEWTON: {
    code: 'NEWTON', name: 'Isaac Newton', subject: 'Sciences',
    years: '1643 – 1727', role: 'Physicien & mathématicien', place: 'Woolsthorpe, Angleterre',
    didYouKnow: "La légende dit qu'une pomme qui tombe lui aurait inspiré la théorie de la gravitation.",
    works: ['Loi de la gravitation universelle', 'Lois du mouvement', 'Travaux en optique'],
    by: 'Figures', niveau: '4e', langue: 'Français',
    questions: [
      { q: 'Quelle loi célèbre Newton a-t-il formulée ?', options: ['La relativité', 'La gravitation universelle', "L'évolution", 'La thermodynamique'], correct: 1, fact: { label: 'Loi célèbre', value: 'La gravitation universelle' } },
      { q: 'Combien de lois du mouvement Newton a-t-il énoncées ?', options: ['2', '3', '4', '5'], correct: 1, fact: { label: 'Lois du mouvement', value: '3 lois' } },
      { q: 'Dans quel pays est né Isaac Newton ?', options: ['France', 'Allemagne', 'Angleterre', 'Italie'], correct: 2, fact: { label: 'Pays natal', value: 'Angleterre' } },
      { q: 'Dans quel domaine scientifique a-t-il aussi beaucoup travaillé ?', options: ['Optique', 'Chimie organique', 'Génétique', 'Géologie'], correct: 0, fact: { label: 'Autre domaine', value: "L'optique (décomposition de la lumière)" } },
      { q: 'Newton est aussi le co-inventeur de quelle branche des mathématiques ?', options: ['La géométrie', 'Le calcul infinitésimal', 'La théorie des nombres', 'La topologie'], correct: 1, fact: { label: 'Mathématiques', value: 'Le calcul infinitésimal' } },
    ],
  },
  CESAR: {
    code: 'CESAR', name: 'Jules César', subject: 'Histoire',
    years: '-100 – -44', role: 'Général & homme d\'État romain', place: 'Rome',
    didYouKnow: "Il a été assassiné par un groupe de sénateurs, dont son allié Brutus, un jour d'ides de mars.",
    works: ['Conquête de la Gaule', 'Réforme du calendrier (calendrier julien)', 'Commentaires sur la guerre des Gaules'],
    by: 'Figures', niveau: '4e', langue: 'Français',
    questions: [
      { q: 'Quel territoire Jules César a-t-il conquis pour Rome ?', options: ['L\'Égypte', 'La Gaule', 'La Grèce', 'La Perse'], correct: 1, fact: { label: 'Conquête', value: 'La Gaule' } },
      { q: 'Comment Jules César est-il mort ?', options: ['À la guerre', 'Assassiné par des sénateurs', 'De maladie', 'En exil'], correct: 1, fact: { label: 'Mort', value: 'Assassiné par des sénateurs (ides de mars)' } },
      { q: 'Quel calendrier porte son nom ?', options: ['Le calendrier grégorien', 'Le calendrier julien', 'Le calendrier romain', 'Le calendrier solaire'], correct: 1, fact: { label: 'Calendrier', value: 'Le calendrier julien' } },
      { q: 'Quel titre finit-il par obtenir à Rome ?', options: ['Roi', 'Consul à vie / dictateur', 'Empereur', 'Sénateur'], correct: 1, fact: { label: 'Titre', value: 'Dictateur à vie' } },
      { q: 'Quel est le nom de son allié devenu l\'un de ses assassins ?', options: ['Marc Antoine', 'Brutus', 'Pompée', 'Cicéron'], correct: 1, fact: { label: 'Assassin célèbre', value: 'Brutus' } },
    ],
  },
  MOLIERE: {
    code: 'MOLIERE', name: 'Molière', subject: 'Littérature',
    years: '1622 – 1673', role: 'Dramaturge & comédien', place: 'Paris, France',
    didYouKnow: "Il est mort peu après être monté sur scène pour jouer... Le Malade imaginaire.",
    works: ['Le Malade imaginaire', 'Le Bourgeois gentilhomme', 'Tartuffe'],
    by: 'Figures', niveau: '4e', langue: 'Français',
    questions: [
      { q: 'Quel est le vrai nom de Molière ?', options: ['Jean-Baptiste Poquelin', 'Jean Racine', 'Pierre Corneille', 'François Villon'], correct: 0, fact: { label: 'Vrai nom', value: 'Jean-Baptiste Poquelin' } },
      { q: 'Quel genre théâtral Molière a-t-il particulièrement excellé ?', options: ['La tragédie', 'La comédie', 'Le drame', 'Le vaudeville moderne'], correct: 1, fact: { label: 'Genre', value: 'La comédie' } },
      { q: 'Dans quelle pièce se moque-t-il de la médecine de son temps ?', options: ['Tartuffe', 'Le Malade imaginaire', 'L\'Avare', 'Dom Juan'], correct: 1, fact: { label: 'Pièce', value: "Le Malade imaginaire" } },
      { q: 'Quel roi a soutenu et protégé Molière ?', options: ['Louis XIII', 'Louis XIV', 'Henri IV', 'François Ier'], correct: 1, fact: { label: 'Protecteur royal', value: 'Louis XIV' } },
      { q: 'Comment Molière est-il mort ?', options: ['En exil', 'Peu après avoir joué sur scène', 'À la guerre', 'De vieillesse'], correct: 1, fact: { label: 'Mort', value: 'Peu après une représentation du Malade imaginaire' } },
    ],
  },
  VANGOGH: {
    code: 'VANGOGH', name: 'Vincent van Gogh', subject: 'Artistes',
    years: '1853 – 1890', role: 'Peintre postimpressionniste', place: 'Groot-Zundert, Pays-Bas',
    didYouKnow: "Il n'a vendu qu'un seul tableau de son vivant, mais est aujourd'hui l'un des peintres les plus célèbres au monde.",
    works: ['La Nuit étoilée', 'Les Tournesols', 'La Chambre à Arles'],
    by: 'Figures', niveau: '4e', langue: 'Français',
    questions: [
      { q: 'Dans quel pays Vincent van Gogh est-il né ?', options: ['France', 'Belgique', 'Pays-Bas', 'Allemagne'], correct: 2, fact: { label: 'Pays natal', value: 'Pays-Bas' } },
      { q: 'Quel style de peinture pratique-t-il ?', options: ['Le postimpressionnisme', 'Le cubisme', 'La Renaissance', 'Le baroque'], correct: 0, fact: { label: 'Style', value: 'Le postimpressionnisme' } },
      { q: 'Quel tableau célèbre représente un ciel tourbillonnant ?', options: ['Les Tournesols', 'La Nuit étoilée', 'La Chambre à Arles', 'Le Semeur'], correct: 1, fact: { label: 'Tableau célèbre', value: 'La Nuit étoilée' } },
      { q: 'Combien de tableaux a-t-il vendus de son vivant ?', options: ['0', '1', '10', 'Une centaine'], correct: 1, fact: { label: 'Ventes de son vivant', value: '1 seul tableau' } },
      { q: 'Dans quelle ville française a-t-il peint de nombreuses œuvres célèbres ?', options: ['Paris', 'Arles', 'Nice', 'Lyon'], correct: 1, fact: { label: 'Ville en France', value: 'Arles' } },
    ],
  },
  MOZART: {
    code: 'MOZART', name: 'Wolfgang Amadeus Mozart', subject: 'Musique',
    years: '1756 – 1791', role: 'Compositeur', place: 'Salzbourg, Autriche',
    didYouKnow: "Il composait déjà de la musique à l'âge de 5 ans et donnait des concerts dans toute l'Europe enfant.",
    works: ['La Flûte enchantée', 'Requiem', 'Symphonie n°40'],
    by: 'Figures', niveau: '4e', langue: 'Français',
    questions: [
      { q: 'Dans quel pays Mozart est-il né ?', options: ['Allemagne', 'Autriche', 'Suisse', 'Italie'], correct: 1, fact: { label: 'Pays natal', value: 'Autriche' } },
      { q: 'À quel âge Mozart a-t-il commencé à composer ?', options: ['Vers 5 ans', 'Vers 15 ans', 'Vers 20 ans', 'Vers 25 ans'], correct: 0, fact: { label: 'Enfant prodige', value: 'Dès environ 5 ans' } },
      { q: 'Quel opéra célèbre a-t-il composé ?', options: ['La Flûte enchantée', 'Carmen', 'La Traviata', 'Aïda'], correct: 0, fact: { label: 'Opéra célèbre', value: 'La Flûte enchantée' } },
      { q: 'Quelle œuvre inachevée est restée célèbre à sa mort ?', options: ['Une symphonie', 'Le Requiem', 'Un concerto', 'Une sonate'], correct: 1, fact: { label: 'Œuvre inachevée', value: 'Le Requiem' } },
      { q: 'À quel courant musical Mozart appartient-il ?', options: ['Le baroque', 'Le classicisme', 'Le romantisme', 'Le moderne'], correct: 1, fact: { label: 'Courant musical', value: 'Le classicisme' } },
    ],
  },
  OWENS: {
    code: 'OWENS', name: 'Jesse Owens', subject: 'Sportifs',
    years: '1913 – 1980', role: 'Athlète (sprint & saut en longueur)', place: 'Oakville, États-Unis',
    didYouKnow: "Il a remporté 4 médailles d'or aux Jeux olympiques de Berlin en 1936, sous le régime nazi qui prônait la suprématie blanche.",
    works: ["4 médailles d'or aux JO de 1936", 'Record du monde du saut en longueur', "Icône de la lutte contre le racisme dans le sport"],
    by: 'Figures', niveau: '4e', langue: 'Français',
    questions: [
      { q: 'Combien de médailles d\'or Jesse Owens a-t-il remportées aux JO de 1936 ?', options: ['1', '2', '4', '6'], correct: 2, fact: { label: 'Médailles JO 1936', value: "4 médailles d'or" } },
      { q: 'Dans quelle ville se déroulaient ces Jeux olympiques ?', options: ['Londres', 'Berlin', 'Paris', 'Los Angeles'], correct: 1, fact: { label: 'Ville des JO', value: 'Berlin (1936)' } },
      { q: 'Dans quelles disciplines Jesse Owens excellait-il ?', options: ['Natation', 'Sprint et saut en longueur', 'Boxe', 'Gymnastique'], correct: 1, fact: { label: 'Disciplines', value: 'Sprint et saut en longueur' } },
      { q: 'Pourquoi sa performance aux JO de 1936 a-t-elle une portée historique ?', options: ['Premier JO télévisés', 'Elle a démenti la propagande raciste nazie', 'Il était le plus jeune champion', 'Il a battu un record vieux de 100 ans'], correct: 1, fact: { label: 'Portée historique', value: 'A démenti la propagande raciste nazie' } },
      { q: 'De quel pays Jesse Owens est-il originaire ?', options: ['France', 'Jamaïque', 'États-Unis', 'Kenya'], correct: 2, fact: { label: 'Pays', value: 'États-Unis' } },
    ],
  },
};

// Seed data mirroring the demo class shipped in the original web app.
export const SHARED_QUIZ: QuizDef = {
  code: 'NAPOL', name: 'Napoléon Bonaparte', subject: 'Histoire',
  years: '1769 – 1821', role: "Empereur des Français", place: 'Ajaccio, Corse',
  didYouKnow: "Il a instauré le Code civil, toujours en vigueur (avec des modifications) en France aujourd'hui.",
  works: ['Code civil', 'Sacre comme empereur en 1804', 'Campagnes militaires en Europe'],
  by: 'Mme Durand', niveau: '4e', langue: 'Français', classId: 'c1',
  questions: [
    { q: 'En quelle année Napoléon se fait-il sacrer empereur ?', options: ['1789', '1799', '1804', '1815'], correct: 2, fact: { label: 'Sacre', value: '1804' } },
    { q: 'Quel texte juridique majeur porte son influence ?', options: ['La Déclaration des droits', 'Le Code civil', 'La Constitution de l\'an VIII', 'Le Concordat'], correct: 1, fact: { label: 'Texte juridique', value: 'Le Code civil' } },
    { q: 'Sur quelle île est-il né ?', options: ['Sicile', 'Corse', 'Sardaigne', 'Malte'], correct: 1, fact: { label: 'Île natale', value: 'Corse' } },
    { q: 'Quelle bataille marque sa défaite finale en 1815 ?', options: ['Austerlitz', 'Waterloo', 'Trafalgar', 'Iéna'], correct: 1, fact: { label: 'Défaite finale', value: 'Waterloo (1815)' } },
    { q: 'Où est-il mort en exil ?', options: ['Elbe', 'Sainte-Hélène', 'Corse', 'Malte'], correct: 1, fact: { label: 'Lieu de mort', value: "Île de Sainte-Hélène" } },
  ],
};

export const DEMO_CLASS = {
  id: 'c1',
  code: '4EB-2026',
  name: '4e B',
  teachers: ['M. Lemaire', 'Mme Durand'],
};

export const DEMO_STUDENTS = [
  { name: 'Camille Roux', fiches: 6, pct: '83%' },
  { name: 'Yanis Bouaziz', fiches: 4, pct: '60%' },
  { name: 'Inès Lefèvre', fiches: 8, pct: '95%' },
  { name: 'Tom Garnier', fiches: 2, pct: '40%' },
  { name: 'Sarah Benali', fiches: 5, pct: '70%' },
];

export const DEMO_CODES = ['CURIE', 'HUGO'];
