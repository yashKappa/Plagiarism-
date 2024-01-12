const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});




// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
})







const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
	if(window.innerWidth < 576) {
		e.preventDefault();
		searchForm.classList.toggle('show');
		if(searchForm.classList.contains('show')) {
			searchButtonIcon.classList.replace('bx-search', 'bx-x');
		} else {
			searchButtonIcon.classList.replace('bx-x', 'bx-search');
		}
	}
})





if(window.innerWidth < 768) {
	sidebar.classList.add('hide');
} else if(window.innerWidth > 576) {
	searchButtonIcon.classList.replace('bx-x', 'bx-search');
	searchForm.classList.remove('show');
}


window.addEventListener('resize', function () {
	if(this.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
})


document.addEventListener('DOMContentLoaded', function () {
	const switchMode = document.getElementById('switch-mode');

	// Retrieve user preference from localStorage
	const darkModePreference = localStorage.getItem('switch-mode');

	// Set the initial state based on user preference
	if (darkModePreference === 'dark') {
		document.body.classList.add('dark');
		switchMode.checked = true;
	} else {
		document.body.classList.remove('dark');
		switchMode.checked = false;
	}

	// Listen for changes in the switch
	switchMode.addEventListener('change', function () {
		// Toggle dark mode class on the body
		document.body.classList.toggle('dark', this.checked);

		// Store user preference in localStorage
		localStorage.setItem('switch-mode', this.checked ? 'dark' : 'light');
	});
});




