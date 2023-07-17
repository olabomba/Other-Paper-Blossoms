let clansData;
let schoolsData;
let ringsData;
let skillsData;

let rings = {};
let skills = {};
let status = {};
let glory = {};
let honor = {};

window.onload = function() {
    fetch('data/json/clans.json')
        .then(response => response.json())
        .then(data => {
            clansData = data;
            populateClans();
        });

    fetch('data/json/schools.json')
        .then(response => response.json())
        .then(data => {
            schoolsData = data;
        });
        
    fetch('data/json/rings.json')
        .then(response => response.json())
        .then(data => {
            ringsData = data;
            populateBehavior();
        });
        
	fetch('data/json/skill_groups.json').then(response => response.json())
        .then(data => {
            skillsData = data;
        });

    document.getElementById('allow-other-clan').onchange = function() {
        populateSchools(this.checked);
    };
    
    
    const relationButtons = document.getElementsByName('relation');
	for (let i = 0; i < relationButtons.length; i++) {
		relationButtons[i].addEventListener('change', function() {
			if (this !== null && this.checked) {
				updateQuestion7(this.value);
			}
		});
	}
	const bushidoButtons = document.getElementsByName('bushido');
	for (let i = 0; i < bushidoButtons.length; i++) {
		bushidoButtons[i].addEventListener('change', function() {
			if (this !== null && this.checked) {
				updateQuestion8(this.value);
			}
		});
	}

};

function buildSelectSkills(onchange) {
	// Get the select element
	let skillsList = '<select onchange="' + onchange + '"><option>--Choisissez une comp&eacute;tence--</option>';
	
    for (const group of skillsData) {
		// Create an optgroup element for the group
		skillsList += '<optgroup label="' + group.name + '">';

		// Fill the optgroup with options for each skill
		for (const skill of group.skills) {
			skillsList += '<option value="' + skill + '">' + skill + '</option>';
		}
	}
    skillsList += '</select>';
	return skillsList;
}

function updateQuestion7(val) {
	
	const details = document.getElementById('relation-details');
	if (val === 'positive') {
		glory['relation'] = 5;
		skills['relation'] = [];
		details.innerHTML = '<p>Glory Increase: 5</p>';
		displayChosenSkills();
	} else {
		glory['relation'] = 0;
		details.innerHTML = 'Choisir une comp&eacutetence en rapport :<br />' + buildSelectSkills('updateQuestion7Skill(event)');
	}
    updateSummary('glory', addValues(glory));
}

function updateQuestion7Skill(e) {
	const value = e.target.value;
	if (e.target.selectedIndex !== 0) skills['relation'] = [value]; else skills['relation'] = [];
    displayChosenSkills();
}

function updateQuestion8(val) {
	
	const details = document.getElementById('bushido-details');
	if (val === 'positive') {
		honor['bushido'] = 10;
		skills['bushido'] = [];
		details.innerHTML = '<p>Honor Increase: 10</p>';
		displayChosenSkills();
	} else {
		honor['bushido'] = 0;
		details.innerHTML = 'Choisir une comp&eacutetence en rapport :<br />' + buildSelectSkills('updateQuestion8Skill(event)');
	}
    updateSummary('honor', addValues(honor));
}

function updateQuestion8Skill(e) {
	const value = e.target.value;
	if (e.target.selectedIndex !== 0) skills['bushido'] = [value]; else skills['bushido'] = [];
    displayChosenSkills();
}

function countOccurrences(obj, value) {
  var count = 0;
  // Parcours chaque clé dans l'objet
  Object.keys(obj).forEach(function(key) {
		const element = obj[key];
		if (Array.isArray(element)) {
		  // Si l'élément est un tableau, parcours chaque valeur du tableau
		  element.forEach(function(item) {
			if (item === value) {
			  count++;
			}
		  });
		} else if (element === value) {
		  // Si l'élément est une valeur simple et correspond à celle recherchée
		  count++;
		}

  });

  return count;
}

function listValues(obj, excludeKey) {
	let text = '';
    Object.keys(obj).forEach(function(key) {
		if (key === excludeKey) {
			return;
		}
		const array = obj[key];
		  // Parcours chaque élément du tableau
		  array.forEach(function(value) {
			text += '<li>' + value + '</li>';
		  });
	});
	return text;
}

function addValues(obj) {
	let total = 0;
    Object.values(obj).forEach(function(val) {
		total += val;
	});
	return total;
}

function populateClans() {
    const clanSelect = document.getElementById('clan');
    clansData.forEach((clan, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.innerText = clan.name;
        clanSelect.appendChild(option);
    });

    clanSelect.onchange = function() {
		// TODO comme pour les questions 7/8 ignorer si on est sur l'index 0
        populateFamilies(this.value);
        displayClanDetails(this.value);
        
        // clan
		const clan = clansData[this.selectedIndex - 1];
		skills['clan'] = [clan.skill_increase];
    
        displayChosenSkills();
        updateSummary('chosen-clan', this.options[this.selectedIndex].text);
    };
}

function populateBehavior() {
    const ringsSelect = document.getElementById('behavior');
    ringsData.forEach((ring, index) => {
        const option = document.createElement('option');
        option.value = ring.name;
        option.innerText = ring.outstanding_quality;
        ringsSelect.appendChild(option);
    });

    ringsSelect.onchange = function() {
       
        // behavior
		const ring = ringsData[this.selectedIndex - 1].name;
		rings['behavior'] = ring;
		updateRingValues();
		const details = document.getElementById('behavior-details');
		details.innerHTML = '<p>Ring Increase: ' + ring + '</p>';
    };
}

function displayClanDetails(clanIndex) {
    const clan = clansData[clanIndex];
    const details = document.getElementById('clan-details');
    details.innerHTML = '<p>Reference: ' + parseObject(clan.reference) + '</p>' +
                        '<p>Type: ' + clan.type + '</p>' +
                        '<p>Ring Increase: ' + clan.ring_increase + '</p>' +
                        '<p>Skill Increase: ' + clan.skill_increase + '</p>' +
                        '<p>Status: ' + clan.status + '</p>';

	
    rings['clan'] = clan.ring_increase;
    status['clan'] = clan.status;
    updateRingValues();
    updateSummary('status', addValues(status));
}

function populateFamilies(clanIndex) {
    const familySelect = document.getElementById('famille');
    familySelect.innerHTML = '<option value="">--Choisissez une famille--</option>';

    const ringSelect = document.getElementById('anneau');
    ringSelect.innerHTML = '<option value="">--Choisissez un anneau--</option>';

    clansData[clanIndex].families.forEach((family, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.innerText = family.name;
        familySelect.appendChild(option);
    });

    familySelect.onchange = function() {
		 // family
		const family = clansData[clanIndex].families[this.selectedIndex - 1];
		skills['family'] = family.skill_increase;
		
        displayChosenSkills();
        populateRings(clanIndex, this.value);
        displayFamilyDetails(clanIndex, this.value);
        
        const wealth = clansData[clanIndex].families[this.value].wealth;
    
        updateSummary('wealth', wealth + ' kokus');
        updateSummary('chosen-family', this.options[this.selectedIndex].text);
    };
}


function displayFamilyDetails(clanIndex, familyIndex) {
    const family = clansData[clanIndex].families[familyIndex];
    const details = document.getElementById('family-details');
    details.innerHTML = '<p>Reference: ' + parseObject(family.reference) + '</p>' +
                        '<p>Skill Increase: ' + family.skill_increase + '</p>' +
                        '<p>Glory: ' + family.glory + '</p>' +
                        '<p>Wealth: ' + family.wealth + ' kokus</p>';

    glory['clan'] = family.glory;
    updateSummary('glory', addValues(glory));
}

function populateRings(clanIndex, familyIndex) {
    const ringSelect = document.getElementById('anneau');
    ringSelect.innerHTML = '<option value="">--Choisissez un anneau--</option>';

    const ringIncrease = clansData[clanIndex].families[familyIndex].ring_increase;
    ringIncrease.forEach((ring, index) => {
        const option = document.createElement('option');
        option.value = ring;
        option.innerText = ring;
        ringSelect.appendChild(option);
    });

    ringSelect.onchange = function() {
        rings['ring'] = this.options[this.selectedIndex].text;
        updateRingValues();
        populateSchools(document.getElementById('allow-other-clan').checked);
    };
}

function populateSchools(allowOtherClan) {
    const schoolSelect = document.getElementById('ecole');
    schoolSelect.innerHTML = '<option value="">--Choisissez une &eacute;cole--</option>';

    const selectedClan = document.getElementById('clan').options[document.getElementById('clan').selectedIndex].text;
    schoolsData.forEach((school, index) => {
        if (allowOtherClan || school.clan === selectedClan) {
            const option = document.createElement('option');
            option.value = index;
            option.innerText = school.name;
            schoolSelect.appendChild(option);
        }
    });

    schoolSelect.onchange = function() {
        displaySchoolDetails(this.value);
        updateSummary('chosen-school', this.options[this.selectedIndex].text);
    };
}

function deselectOptionByValue(selectElement, value) {
  var options = selectElement.options;
  for (var i = 0; i < options.length; i++) {
    if (options[i].value === value) {
      options[i].selected = false;
      break;
    }
  }
}

function limitSelection(event, size) {
	const selectedOptions = event.target.selectedOptions;
	if (selectedOptions.length > size) {
        alert("Vous ne pouvez pas choisir plus de " + size + " options");
        selectedOptions[selectedOptions.length - 1].selected = false;
    }
}

function displaySchoolDetails(schoolIndex) {
    const school = schoolsData[schoolIndex];
    const details = document.getElementById('school-details');

    // Cr&eacute;er la liste d'&eacute;quipement de d&eacute;part
    let startingOutfitList = '';
    school.starting_outfit.forEach(item => {
        startingOutfitList += '<li>' + parseObject(item) + '</li>';
    });

    // Cr&eacute;er la liste des comp&eacute;tences de d&eacute;part
    
    let startingSkillsList = '<select id="selectStartingSkills" multiple style="height: 200px" onchange="limitSelection(event, ' + school.starting_skills.size + ');updateChosenSkills();displayChosenSkills()">';
    school.starting_skills.set.forEach(skill => {
        startingSkillsList += '<option>' + skill + '</option>';
    });
    startingSkillsList += '</select>';

    // Cr&eacute;er la liste des techniques de d&eacute;part
    let startingTechniquesList = '';
    school.starting_techniques.forEach(technique => {
		const disabled = technique.set.length == 1;
		let techniqueSelect = '<select class="techCombo" ' + (disabled ? 'disabled' : '') + ' onchange="updateChosenTechniques()">';
		technique.set.forEach(option => {
			techniqueSelect += '<option>' + option + '</option>';
		});
		techniqueSelect += '</select>';
		startingTechniquesList += techniqueSelect;
    });
    
    // Ajouter tout à school details
    details.innerHTML = '<p>R&eacute;f&eacute;rence: ' + parseObject(school.reference) + '</p>' +
                        '<p>Clan: ' + school.clan + '</p>' +
                        '<p>Honneur: ' + school.honor + '</p>' +
                        '<p>Techniques disponibles: ' + school.techniques_available + '</p>' +
                        '<p>Capacit&eacute; de l\'&eacute;cole: ' + school.school_ability + '</p>' +
                        '<p>Nombre de comp&#233;tences a&#768; choisir : ' + school.starting_skills.size + '</p>' +
                        '<p>Comp&#233;tences de d&#233;part: ' + startingSkillsList + '</p>' +
                        '<p>Techniques de d&#233;part: ' + startingTechniquesList + '</p>';

    // Mettre à jour les valeurs des anneaux
    rings['school'] = school.ring_increase;
    updateRingValues();
    updateChosenTechniques();

    // Mettre à jour l'honneur
    honor['school'] = school.honor;
    updateSummary('honor', addValues(honor));
    updateSummary('starting-outfit', startingOutfitList);
}

function updateChosenSkills() {
	// choix d'ecole
	skills['chosen'] = [];
    const chosenSkills = document.getElementById('selectStartingSkills');
    if (chosenSkills) {
		
	  // L'élément existe, récupère les valeurs sélectionnées
	  var options = chosenSkills.options;

	  for (var i = 0; i < options.length; i++) {
		if (options[i].selected) {
		  skills['chosen'].push(options[i].value);
		}
	  }
	}
}

function displayChosenSkills() {
	const listHTML = listValues(skills);
	const liRegex = /<li>(.*?)<\/li>/g;
	let matches;
	let occurrences = {};

	// Compte le nombre d'occurrences de chaque élément
	while ((matches = liRegex.exec(listHTML)) !== null) {
		const itemText = matches[1];
		if (occurrences[itemText]) {
		  occurrences[itemText]++;
		} else {
		  occurrences[itemText] = 1;
		}
	}

	// Dédoublonne les éléments et ajoute les chiffres d'occurrence
	let values = '';
	Object.keys(occurrences).forEach(function(itemText) {
		var count = occurrences[itemText];
		values += '<li>' + itemText + ' (+' + count + ')</li>';
	});

    document.getElementById('starting-skills').innerHTML = values;
}

function updateChosenTechniques() {
	var selectElements = document.querySelectorAll('.techCombo');
	let text = '';
	
	// Parcours chaque élément <select>
	selectElements.forEach(function(selectElement) {
	  var options = selectElement.options;
	  var selectedValue = null;

	  // Parcours les options de chaque <select> pour trouver l'unique valeur sélectionnée
	  for (var i = 0; i < options.length; i++) {
		if (options[i].selected) {
		 	text += '<li>' + options[i].value + '</li>';
		}
	  }
	});
	document.getElementById('starting-techniques').innerHTML = text;
}

function parseObject(obj) {
    return Object.values(obj).join(' / ');
}

function updateRingValues() {
    let text = '';
    const allRings = ["Air", "Earth", "Water", "Void", "Fire"];
    for (let ring in allRings) {
        text += '<li><b>' + allRings[ring] + '</b>: ' + (1 + countOccurrences(rings, allRings[ring])) + '</li>';
    }
    document.getElementById('ring-values').innerHTML = text;
}

function updateSummary(id, text) {
    document.getElementById(id).innerHTML = text;
}
