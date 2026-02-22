export interface MedicalTheme {
  id: string;
  name: string;
  description: string;
  diseases: ThemeDisease[];
}

export interface ThemeDisease {
  id: string;
  mainDiagnose: string;
  differentialDiagnose: string;
}

export interface DiseaseCard {
  id: string;
  name: string;
  type: 'main' | 'differential';
  themeId: string;
  paired?: string; // ID of the paired disease
}

export const MEDICAL_THEMES: MedicalTheme[] = [
  {
    id: 'musculoskeletal',
    name: 'Musculoskeletal',
    description: 'Disorders affecting muscles, bones, joints, and connective tissues',
    diseases: [
      { id: 'ms1', mainDiagnose: 'Closed fracture', differentialDiagnose: 'Open fracture' },
      { id: 'ms2', mainDiagnose: 'Fracture', differentialDiagnose: 'Dislocation' },
      { id: 'ms3', mainDiagnose: 'Osteoporosis', differentialDiagnose: 'Osteoarthritis' },
      { id: 'ms4', mainDiagnose: 'ACL tear', differentialDiagnose: 'Menical tear' },
      { id: 'ms5', mainDiagnose: 'Achilles tendon ruptur', differentialDiagnose: 'Ankle sprain' },
      { id: 'ms6', mainDiagnose: 'Osteoarthritis', differentialDiagnose: 'Rheumatoid arthritis' },
      { id: 'ms7', mainDiagnose: 'Osteoarthritis', differentialDiagnose: 'Gout' },
      { id: 'ms8', mainDiagnose: 'Pes planus (flatfoot)', differentialDiagnose: 'Pes cavus (high arch)' },
      { id: 'ms9', mainDiagnose: 'Genu valgum (x foot)', differentialDiagnose: 'Genu varum (O foot)' },
      { id: 'ms10', mainDiagnose: 'Scoliosis idiopathic', differentialDiagnose: 'Scoliosis congenital' }
    ]
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    description: 'Heart and blood vessel disorders',
    diseases: [
      { id: 'cv1', mainDiagnose: 'Septic shock', differentialDiagnose: 'Hemorrhagic shock' },
      { id: 'cv2', mainDiagnose: 'Cardiogenic shock', differentialDiagnose: 'Septic shock' },
      { id: 'cv3', mainDiagnose: 'Cardiogenic shock', differentialDiagnose: 'Hemorhagic shock' },
      { id: 'cv4', mainDiagnose: 'Stable angina', differentialDiagnose: 'Unstable angina' },
      { id: 'cv5', mainDiagnose: 'NSTEMI', differentialDiagnose: 'STEMI' },
      { id: 'cv6', mainDiagnose: 'Left heart failure', differentialDiagnose: 'Right heart failure' },
      { id: 'cv7', mainDiagnose: 'Essential hypertension', differentialDiagnose: 'Secondary hypertension' },
      { id: 'cv8', mainDiagnose: 'Pulmonary hypertension', differentialDiagnose: 'Secondary hypertension' },
      { id: 'cv9', mainDiagnose: 'Rheumatic heart disease', differentialDiagnose: 'Endocarditis' }
    ]
  },
  {
    id: 'respiratory',
    name: 'Respiratory',
    description: 'Lung and airway disorders',
    diseases: [
      { id: 'resp1', mainDiagnose: 'Influenza', differentialDiagnose: 'Pertusis' },
      { id: 'resp2', mainDiagnose: 'SARS', differentialDiagnose: 'Avian influenza' },
      { id: 'resp3', mainDiagnose: 'Influenza', differentialDiagnose: 'Avian influenza' },
      { id: 'resp4', mainDiagnose: 'Pertusis', differentialDiagnose: 'SARS' },
      { id: 'resp5', mainDiagnose: 'Faringitis', differentialDiagnose: 'Tonsilitis' },
      { id: 'resp6', mainDiagnose: 'Laringitis', differentialDiagnose: 'tonsilitis' },
      { id: 'resp7', mainDiagnose: 'Influenza', differentialDiagnose: 'Acute respiratory distress syndrome' },
      { id: 'resp8', mainDiagnose: 'Pertusis', differentialDiagnose: 'Pneumonia' },
      { id: 'resp9', mainDiagnose: 'Pertusis', differentialDiagnose: 'Bronchiolitis' },
      { id: 'resp10', mainDiagnose: 'Faringitis', differentialDiagnose: 'Diphtheria' },
      { id: 'resp11', mainDiagnose: 'Faringitis', differentialDiagnose: 'Epiglotitis' },
      { id: 'resp12', mainDiagnose: 'Tonsilitis', differentialDiagnose: 'Epiglotitis' },
      { id: 'resp13', mainDiagnose: 'Tonsilitis', differentialDiagnose: 'Peritonsilar  abcess' },
      { id: 'resp14', mainDiagnose: 'Diphtheria', differentialDiagnose: 'Epiglotitis' },
      { id: 'resp15', mainDiagnose: 'Diphtheria', differentialDiagnose: 'Pertusis' },
      { id: 'resp16', mainDiagnose: 'Bacterial aspiration', differentialDiagnose: 'Mechanical aspiration' },
      { id: 'resp17', mainDiagnose: 'Viral pneumonia', differentialDiagnose: 'Bacterial pneumonia' },
      { id: 'resp18', mainDiagnose: 'Asthma', differentialDiagnose: 'COPD' },
      { id: 'resp19', mainDiagnose: 'Asthma', differentialDiagnose: 'Bronchiolitis' },
      { id: 'resp20', mainDiagnose: 'COPD', differentialDiagnose: 'Bronchiolitis' },
      { id: 'resp21', mainDiagnose: 'COPD', differentialDiagnose: 'Bronchiectasis' },
      { id: 'resp22', mainDiagnose: 'Asthma', differentialDiagnose: 'Bronchiectasis' },
      { id: 'resp23', mainDiagnose: 'Bronchiolitis', differentialDiagnose: 'Acute bronchitis' },
      { id: 'resp24', mainDiagnose: 'Acute bronchitis', differentialDiagnose: 'Asthma' },
      { id: 'resp25', mainDiagnose: 'TBC', differentialDiagnose: 'Lung cancer' },
      { id: 'resp26', mainDiagnose: 'TBC', differentialDiagnose: 'Pneumonia' },
      { id: 'resp27', mainDiagnose: 'Pneumonia', differentialDiagnose: 'Bronchiolitis' },
      { id: 'resp28', mainDiagnose: 'Pneumonia', differentialDiagnose: 'Acute bronchitis' },
      { id: 'resp29', mainDiagnose: 'Lung cancer', differentialDiagnose: 'Pleural effusion' },
      { id: 'resp30', mainDiagnose: 'Secondary Pneumothorax', differentialDiagnose: 'Tension pneumothorax' },
      { id: 'resp31', mainDiagnose: 'Pleural effusion', differentialDiagnose: 'Pneumonia' },
      { id: 'resp32', mainDiagnose: 'Pleural effusion', differentialDiagnose: 'TBC' },
      { id: 'resp33', mainDiagnose: 'Pneumothorax ventil', differentialDiagnose: 'Pneumothorax' },
      { id: 'resp34', mainDiagnose: 'Chronic bronchitis', differentialDiagnose: 'Emphysema' },
      { id: 'resp35', mainDiagnose: 'Pulmonary edema', differentialDiagnose: 'Lung abscess' },
      { id: 'resp36', mainDiagnose: 'Hemothorax', differentialDiagnose: 'Pneumothorax' }
    ]
  },
  {
    id: 'hematoimmunology',
    name: 'Hematoimmunology',
    description: 'Blood and immune system disorders',
    diseases: [
      { id: 'hem1', mainDiagnose: 'Malaria', differentialDiagnose: 'Typhoid' },
      { id: 'hem2', mainDiagnose: 'Dengue fever', differentialDiagnose: 'Measles' },
      { id: 'hem3', mainDiagnose: 'Leptospirosis', differentialDiagnose: 'Dengue' },
      { id: 'hem4', mainDiagnose: 'Immune thrombocytopenia', differentialDiagnose: 'Leukemia' },
      { id: 'hem5', mainDiagnose: 'Hemophilia', differentialDiagnose: 'von Willebrand disease' },
      { id: 'hem6', mainDiagnose: 'Hemophilia', differentialDiagnose: 'Scurvy' },
      { id: 'hem7', mainDiagnose: 'Microcytic anemia', differentialDiagnose: 'Macrocytic anemia' },
      { id: 'hem8', mainDiagnose: 'Acute lymphoblastic leukemia (ALL)', differentialDiagnose: 'Acute myelogenous leukemia (AML)' },
      { id: 'hem9', mainDiagnose: 'Chronic lymphocytic leukemia (CLL)', differentialDiagnose: 'Chronic myelogenous leukemia (CML)' },
      { id: 'hem10', mainDiagnose: 'Alpha thalassemia', differentialDiagnose: 'Beta thalassemia' },
      { id: 'hem11', mainDiagnose: 'Hodgkin lymphoma', differentialDiagnose: 'Non Hodgkin lymphoma' },
      { id: 'hem12', mainDiagnose: 'Systemic lupus erythematosus (SLE)', differentialDiagnose: 'Lymphoma' },
      { id: 'hem13', mainDiagnose: 'Systemic lupus erythematosus (SLE)', differentialDiagnose: 'Rheumatoid arthritis' }
    ]
  },
  {
    id: 'neurobehavior',
    name: 'Neurobehavior',
    description: 'Neurological and behavioral disorders',
    diseases: [
      { id: 'neuro1', mainDiagnose: 'Meningitis', differentialDiagnose: 'Stroke' },
      { id: 'neuro2', mainDiagnose: 'Meningitis', differentialDiagnose: 'Encephalitis' },
      { id: 'neuro3', mainDiagnose: 'Viral encephalitis', differentialDiagnose: 'Bacterial encephalitis' },
      { id: 'neuro4', mainDiagnose: 'Ischemic stroke', differentialDiagnose: 'Hemorrhagic stroke' },
      { id: 'neuro5', mainDiagnose: 'Bell\'s palsy', differentialDiagnose: 'Stroke' },
      { id: 'neuro6', mainDiagnose: 'Parkinson\'s disease', differentialDiagnose: 'Parkinsonism' },
      { id: 'neuro7', mainDiagnose: 'Simple febrile seizure', differentialDiagnose: 'Complex febrile seizure' },
      { id: 'neuro8', mainDiagnose: 'Seizure', differentialDiagnose: 'Febrile seizure' },
      { id: 'neuro9', mainDiagnose: 'Epilepsy', differentialDiagnose: 'Transient Ischemic Attack (TIA)' },
      { id: 'neuro10', mainDiagnose: 'Epilepsy', differentialDiagnose: 'Status epilepticus' },
      { id: 'neuro11', mainDiagnose: 'Status epilepticus', differentialDiagnose: 'Ischemic stroke' },
      { id: 'neuro12', mainDiagnose: 'Alzheimer dementia', differentialDiagnose: 'Vascular dementia' },
      { id: 'neuro13', mainDiagnose: 'Wernicke\'s aphasia', differentialDiagnose: 'Broca\'s aphasia' },
      { id: 'neuro14', mainDiagnose: 'Panic disorder', differentialDiagnose: 'Anxiety disorder' },
      { id: 'neuro15', mainDiagnose: 'Schizophrenia', differentialDiagnose: 'Schizophreniform' },
      { id: 'neuro16', mainDiagnose: 'Posttraumatic stress disorder (PTSD)', differentialDiagnose: 'Acute stress disorder' },
      { id: 'neuro17', mainDiagnose: 'Posttraumatic stress disorder (PTSD)', differentialDiagnose: 'Adjustment disorder' },
      { id: 'neuro18', mainDiagnose: 'Bipolar disorder', differentialDiagnose: 'Major depressive disorder' },
      { id: 'neuro19', mainDiagnose: 'Bipolar disorder', differentialDiagnose: 'Anxiety disorder' }
    ]
  },
  {
    id: 'special_senses',
    name: 'Special Senses',
    description: 'Eye, ear, nose, and throat disorders',
    diseases: [
      { id: 'ss1', mainDiagnose: 'Congenital Rubella', differentialDiagnose: 'Toxoplasmosis' },
      { id: 'ss2', mainDiagnose: 'Congenital Rubella', differentialDiagnose: 'Measles' },
      { id: 'ss3', mainDiagnose: 'Otitis media', differentialDiagnose: 'Cholesteatoma' },
      { id: 'ss4', mainDiagnose: 'Otitis media', differentialDiagnose: 'Otitis externa' },
      { id: 'ss5', mainDiagnose: 'Acute otitis media', differentialDiagnose: 'Chronic suppurative otitis media' },
      { id: 'ss6', mainDiagnose: 'Acute otitis media', differentialDiagnose: 'Otitis media with effusion' },
      { id: 'ss7', mainDiagnose: 'Allergic rhinitis', differentialDiagnose: 'Vasomotor rhinitis' },
      { id: 'ss8', mainDiagnose: 'Allergic rhinitis', differentialDiagnose: 'Infectious rhinitis' },
      { id: 'ss9', mainDiagnose: 'Acute viral rhinosinusitis', differentialDiagnose: 'Bacterial rhinosinusitis' },
      { id: 'ss10', mainDiagnose: 'Rhinitis', differentialDiagnose: 'Rhinosinusitis' },
      { id: 'ss11', mainDiagnose: 'Perichondritis', differentialDiagnose: 'Auricular hematoma' },
      { id: 'ss12', mainDiagnose: 'Mastoiditis', differentialDiagnose: 'Otitis externa' },
      { id: 'ss13', mainDiagnose: 'Benign paroxysmal positional vertigo (BPPV)', differentialDiagnose: 'Menier\'s disease' },
      { id: 'ss14', mainDiagnose: 'Benign paroxysmal positional vertigo (BPPV)', differentialDiagnose: 'Labyrinthitis' },
      { id: 'ss15', mainDiagnose: 'Labyrinthitis', differentialDiagnose: 'Vestibular neuritis' },
      { id: 'ss16', mainDiagnose: 'Labyrinthitis', differentialDiagnose: 'Menier\'s disease' },
      { id: 'ss17', mainDiagnose: 'Anterior epistaxis', differentialDiagnose: 'Posterior epistaxis' },
      { id: 'ss18', mainDiagnose: 'Entropion', differentialDiagnose: 'Trichiasis' },
      { id: 'ss19', mainDiagnose: 'Conjunctivitis', differentialDiagnose: 'Keratitis' },
      { id: 'ss20', mainDiagnose: 'Scleritis', differentialDiagnose: 'Episcleritis' },
      { id: 'ss21', mainDiagnose: 'Hordeolum', differentialDiagnose: 'Chalazion' },
      { id: 'ss22', mainDiagnose: 'Open angle glaucoma', differentialDiagnose: 'Close angle glaucoma' },
      { id: 'ss23', mainDiagnose: 'Cataract', differentialDiagnose: 'Glaucoma' },
      { id: 'ss24', mainDiagnose: 'Astigmatism', differentialDiagnose: 'Myopia' },
      { id: 'ss25', mainDiagnose: 'Astigmatism', differentialDiagnose: 'Hyperopia' },
      { id: 'ss26', mainDiagnose: 'Astigmatism', differentialDiagnose: 'Presbyopia' },
      { id: 'ss27', mainDiagnose: 'Lagophtalmos', differentialDiagnose: 'Blepharitis' },
      { id: 'ss28', mainDiagnose: 'Esotropia', differentialDiagnose: 'Exotropia' },
      { id: 'ss29', mainDiagnose: 'Dacryocystitis', differentialDiagnose: 'Dacryoadenitis' }
    ]
  },
  {
    id: 'dermatovenereology',
    name: 'Dermatovenereology',
    description: 'Skin and sexually transmitted disease disorders',
    diseases: [
      { id: 'derm1', mainDiagnose: 'Varicella (chickenpox)', differentialDiagnose: 'Smallpox' },
      { id: 'derm2', mainDiagnose: 'Varicella (chickenpox)', differentialDiagnose: 'Monkeypox' },
      { id: 'derm3', mainDiagnose: 'Varicella (chickenpox)', differentialDiagnose: 'Impetigo' },
      { id: 'derm4', mainDiagnose: 'Nonbullous impetigo', differentialDiagnose: 'Bullous impetigo' },
      { id: 'derm5', mainDiagnose: 'Impetigo', differentialDiagnose: 'Cellulitis' },
      { id: 'derm6', mainDiagnose: 'Acne vulgaris', differentialDiagnose: 'Folliculitis' },
      { id: 'derm7', mainDiagnose: 'Acne vulgaris', differentialDiagnose: 'Rosacea' },
      { id: 'derm8', mainDiagnose: 'Carbuncle', differentialDiagnose: 'Furuncle' },
      { id: 'derm9', mainDiagnose: 'Irritant contact dermatitis', differentialDiagnose: 'Allergic contact dermatitis' },
      { id: 'derm10', mainDiagnose: 'Stevens-Johnson syndrome (SJS)', differentialDiagnose: 'Toxic epidermal necrolysis (TEN)' },
      { id: 'derm11', mainDiagnose: 'Pityriasis alba', differentialDiagnose: 'Tinea versicolor' },
      { id: 'derm12', mainDiagnose: 'Pityriasis alba', differentialDiagnose: 'Vitiligo' },
      { id: 'derm13', mainDiagnose: 'Pityriasis alba', differentialDiagnose: 'Morbus Hansen (leprosy)' },
      { id: 'derm14', mainDiagnose: 'Tuberculoid leprosy', differentialDiagnose: 'Lepromatous leprosy' },
      { id: 'derm15', mainDiagnose: 'Scabies', differentialDiagnose: 'Eczema' },
      { id: 'derm16', mainDiagnose: 'Alopecia areata', differentialDiagnose: 'Androgenetic alopecia' },
      { id: 'derm17', mainDiagnose: 'Miliaria', differentialDiagnose: 'Varicella' },
      { id: 'derm18', mainDiagnose: 'Urticaria', differentialDiagnose: 'Angioedema' },
      { id: 'derm19', mainDiagnose: 'Angioedema', differentialDiagnose: 'Anaphylaxis' },
      { id: 'derm20', mainDiagnose: 'Callus', differentialDiagnose: 'Clavus' },
      { id: 'derm21', mainDiagnose: 'Seborrheic dermatitis', differentialDiagnose: 'Psoriasis' },
      { id: 'derm22', mainDiagnose: 'Paronychia', differentialDiagnose: 'Psoriasis' },
      { id: 'derm23', mainDiagnose: 'Paronychia', differentialDiagnose: 'Onychomycosis' },
      { id: 'derm24', mainDiagnose: 'Gonorrhea Urethritis', differentialDiagnose: 'Non-Gonorrhea Urethritis' },
      { id: 'derm25', mainDiagnose: 'Herpes Simplex', differentialDiagnose: 'Herpes Zoster' },
      { id: 'derm26', mainDiagnose: 'Chancroid', differentialDiagnose: 'Herpes Simplex' },
      { id: 'derm27', mainDiagnose: 'Syphilis', differentialDiagnose: 'Chancroid' }
    ]
  },
  {
    id: 'endocrinology',
    name: 'Endocrinology',
    description: 'Hormone and endocrine system disorders',
    diseases: [
      { id: 'endo1', mainDiagnose: 'Hyperthyroidism', differentialDiagnose: 'Hypothyroidism' },
      { id: 'endo2', mainDiagnose: 'Graves disease', differentialDiagnose: 'Hashimoto thyroiditis' },
      { id: 'endo3', mainDiagnose: 'Graves disease', differentialDiagnose: 'Toxic multinodular goiter' },
      { id: 'endo4', mainDiagnose: 'Type 2 DM', differentialDiagnose: 'Type 1 DM' },
      { id: 'endo5', mainDiagnose: 'Cushing syndrome', differentialDiagnose: 'Obesity' },
      { id: 'endo6', mainDiagnose: 'Cushing syndrome', differentialDiagnose: 'Addison disease' },
      { id: 'endo7', mainDiagnose: 'Polycystic ovarian syndrome (PCOS)', differentialDiagnose: 'Hypothyroid' },
      { id: 'endo8', mainDiagnose: 'Constitutional delay of growth and puberty (CDGP)', differentialDiagnose: 'Hypogonadotropic hypogonadism (HH)' },
      { id: 'endo9', mainDiagnose: 'Acromegaly', differentialDiagnose: 'Gigantism' },
      { id: 'endo10', mainDiagnose: 'Primary polidypsia', differentialDiagnose: 'Nephrogenic diabetes insipidus' },
      { id: 'endo11', mainDiagnose: 'Primary polidypsia', differentialDiagnose: 'Central diabetes insipidus' },
      { id: 'endo12', mainDiagnose: 'Hyperosmolar hyperglycemic state (HHS)', differentialDiagnose: 'Diabetic ketoacidosis (DKA)' }
    ]
  },
  {
    id: 'metabolic_nutrition',
    name: 'Metabolic and Nutrition',
    description: 'Metabolic and nutritional disorders',
    diseases: [
      { id: 'meta1', mainDiagnose: 'Marasmus', differentialDiagnose: 'Kwashiorkor' },
      { id: 'meta2', mainDiagnose: 'Wasting', differentialDiagnose: 'Stunting' },
      { id: 'meta3', mainDiagnose: 'Metabolic Syndrome', differentialDiagnose: 'Hypothyroidism' },
      { id: 'meta4', mainDiagnose: 'Hyperuricemia', differentialDiagnose: 'Gout' },
      { id: 'meta5', mainDiagnose: 'Beriberi', differentialDiagnose: 'Wernicke-Korsakoff syndrome' },
      { id: 'meta6', mainDiagnose: 'Wet beriberi', differentialDiagnose: 'Dry beriberi' },
      { id: 'meta7', mainDiagnose: 'Rickets', differentialDiagnose: 'Osteomalacia' },
      { id: 'meta8', mainDiagnose: 'B12 deficiency anemia', differentialDiagnose: 'Folate deficiency anemia' }
    ]
  }
];

// Helper function to generate disease cards from themes
export function generateDiseaseCards(themeId: string, playerCount: number): DiseaseCard[] {
  const theme = MEDICAL_THEMES.find(t => t.id === themeId);
  if (!theme) return [];
  
  const cards: DiseaseCard[] = [];
  const shuffledDiseases = [...theme.diseases].sort(() => Math.random() - 0.5);
  
  // Take enough disease pairs to cover all players
  const pairsNeeded = Math.ceil(playerCount / 2);
  const selectedDiseases = shuffledDiseases.slice(0, pairsNeeded);
  
  selectedDiseases.forEach((disease, index) => {
    const mainCard: DiseaseCard = {
      id: `${disease.id}_main`,
      name: disease.mainDiagnose,
      type: 'main',
      themeId,
      paired: `${disease.id}_diff`
    };
    
    const diffCard: DiseaseCard = {
      id: `${disease.id}_diff`,
      name: disease.differentialDiagnose,
      type: 'differential',
      themeId,
      paired: `${disease.id}_main`
    };
    
    cards.push(mainCard, diffCard);
  });
  
  // Shuffle and take exactly playerCount cards
  return cards.sort(() => Math.random() - 0.5).slice(0, playerCount);
}
