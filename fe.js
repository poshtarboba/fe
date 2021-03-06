/* нагадування про перевірку журналу */
reportCardNotification('20:00');

/* актуалізувати роки, місяці в лекціях */
actualDates();

/* хедер */
initContentsHeader();



(function($){
	/* TODO: переписати без jQuery */
	$('.js-toggle').on('click', function(){
		let $that = $(this);
		$('#'+$that.data('id')).stop(true, true).slideToggle(function(){
			$that.toggleClass('active');
		});
	});

})(jQuery);

/* debug */

// (function(){
// 	function bodyAddClass(c){ document.body.classList.add(c); }
// 	function bodyAddMsg(s){ document.body.innerHTML = s + document.body.innerHTML; }
// 	/* крапка в кінці заголовків */
// 	let ttl = ['title', 'h1', 'h2', 'h3', 'h4'];
// 	ttl.forEach(function(tag){
// 		let n = 0;
// 		document.querySelectorAll(tag).forEach(function(e){
// 			let t = e.innerText;
// 			if (t[t.length - 1] === '.') { n++; }
// 		});
// 		if (n) {
// 			bodyAddClass('err');
// 			bodyAddMsg('<p>Dot in ' + tag + '.</p>');
// 		}
// 	});
// 	/* відсутність h1 чи їх надмірна кількість */
// 	let h1 = document.querySelectorAll('h1');
// 	if (h1.length !== 1) {
// 		bodyAddClass('err');
// 		bodyAddMsg('<p>H1 count: ' + h1.length + '</p>');
// 	}
// 	/* кількість скриптів */
// 	let scr = document.querySelectorAll('script');
// 	bodyAddMsg('<p>Scripts: ' + scr.length + '</p>');
// 	/* відсутність meta viewport */
// 	let meta = document.querySelectorAll('meta');
// 	let metavp = 0;
// 	meta.forEach(function(m){ if (m.name === 'viewport') { metavp++; } });
// 	if (metavp === 0) {
// 		bodyAddClass('err');
// 		bodyAddMsg('<p>Meta viewport is absent.</p>');
// 	}
// 	/* наявність додаткових стилів */
// 	let st = document.querySelectorAll('style');
// 	if (st.length) {
// 		bodyAddMsg('<p>Tag &lt;style&gt; present here.</p>');
// 	}
// 	/* якщо немає помилок - то все ок */
// 	if (!document.body.classList.contains('err')) {
// 		bodyAddClass('ok');
// 	}
// })();

function isAdmin() {
	return localStorage.getItem('admin');
}

function add0(n) {
	return n < 10 ? '0' + n : n.toString();
}

function reportCardNotification(time) {
	if (!isAdmin()) return;
	let today = new Date();
	today = today.getFullYear() + '-' + add0(today.getMonth() + 1) + '-' + add0(today.getDate());
	if (localStorage.getItem('reportCardNotificationDate') === today) return;
	let timerId;
	if (tryShowNotification()) return;
	timerId = setInterval(function() {
		tryShowNotification();
	}, 5 * 60 * 1000);
	function tryShowNotification() {
		let now = new Date();
		const [time_hrs, time_min] = time.split(':').map(function(e) { return parseInt(e); });
		const now_hrs = now.getHours();
		const now_min = now.getMinutes();
		if (now_hrs > time_hrs || now_hrs === time_hrs && now_min >= time_min) {
			if (timerId) clearInterval(timerId);
			localStorage.setItem('reportCardNotificationDate', today);
			alert('Заповни журнал.');
			return true;
		}
		return false;
	}
}

function actualDates(){
	let now = new Date();
	let year = now.getFullYear();
	let month = add0(now.getMonth() + 1);
	document.querySelectorAll('.js-year').forEach(function(span){ span.innerHTML = year; });
	document.querySelectorAll('.js-month').forEach(function(span){ span.innerHTML = month; });
	document.querySelectorAll('.js-date-m').forEach(function (span){
		let date = new Date();
		if (span.dataset.m) date.setMonth(date.getMonth() + +span.dataset.m);
		span.innerText = date.getFullYear() + '-' + add0(date.getMonth() + 1);
	});
	document.querySelectorAll('.js-date-y').forEach(function (span){
		let date = new Date();
		if (span.dataset.y) date.setFullYear(date.getFullYear() + +span.dataset.y);
		span.innerText = date.getFullYear();
	});
}


function initContentsHeader(){
	let isContentsPage = document.body.classList.contains('contents-page');
	if (document.body.classList.contains('contents-page')) {
		let contentsPageFile = document.location.pathname.split('/').pop();
		localStorage.setItem('contentsPage', contentsPageFile);
		let button = document.createElement('button');
		button.classList.add('contents-options');
		button.innerHTML = '<i></i><i></i><i></i>';
		button.setAttribute('title', 'Опції');
		document.body.appendChild(button);
		/* TODO: добавити обробник кнопки опцій */
	}
	let contentsPageFile = localStorage.getItem('contentsPage');
	if (!isContentsPage && contentsPageFile) {
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
  		if (xhr.readyState !== 4) return;
  		if (xhr.status !== 200){
    		console.error('Error ' + xhr.status + ': ' + xhr.statusText);
  		} else {
  			let re = /<body.*?>([\s\S]*?)<\/body>/gmi;
  			let html = re.exec(xhr.responseText)[1];
    		if (!html) return;
    		let wrap = document.createElement('div');
    		wrap.innerHTML = html;
    		let currentPageFile = document.location.pathname.split('/').pop();
    		let links = wrap.querySelectorAll('a');
    		let currentPageIndex;
    		for (let i = 0; i < links.length; i++)
    			if (links[i].getAttribute('href') === currentPageFile) {
    				currentPageIndex = i;
    				break;
    			}
    		if (typeof currentPageIndex !== 'number') return;
    		html = '<button class="options" title="Опції"><i></i><i></i><i></i></button>';
    		html += '<p class="prev-next-links">';
    		let href, text;
    		if (currentPageIndex > 0) {
    			let prevPageIndex = currentPageIndex - 1;
    			href = links[prevPageIndex].getAttribute('href');
    			text = links[prevPageIndex].innerText;
    			html += '<a href="'+ href +'" class="prev">' + text + '</a> ';
    		}
    		html += '<a href="' + contentsPageFile + '">Зміст</a>';
    		if (currentPageIndex < links.length - 1) {
    			let nextPageIndex = currentPageIndex + 1;
    			href = links[nextPageIndex].getAttribute('href');
    			text = links[nextPageIndex].innerText;
    			html += ' <a href="'+ href +'" class="next">' + text + '</a>';
    		}
    		html += '</p>';
    		let header = document.createElement('div');
    		header.classList.add('header-autohide');
    		header.innerHTML = html;
    		document.body.appendChild(header);
    		showHideContentsHeader(header);
    		/* TODO: добавити обробник кнопки options */
  		}
		}
		xhr.open('GET', contentsPageFile);
		xhr.send();
	}
}

function showHideContentsHeader(header){
	/*
		TODO: поставити затримку, відстежувати координати
		якщо курсор покинув вікно чи сповз вниз - меню не відображати
	*/
	window.addEventListener('mousemove', function(e){
		headerShown = header.classList.contains('show');
		if (e.clientY > 200 && headerShown) header.classList.remove('show');
		if (e.clientX > window.innerWidth - 100 && e.clientY < 50 && !headerShown) header.classList.add('show');
	});
}

/* facebook comments */
(function(){
	
	return false; // пока отключил
	
	let resize = document.querySelectorAll('.resize');
	if (!resize.length) return;
	resize = resize[resize.length - 1];
	
	let metaAdmins = document.createElement('meta');
	metaAdmins.setAttribute('property', 'fb:admins');
	metaAdmins.setAttribute('content', '100001212951794');
	document.head.appendChild(metaAdmins);
	let metaApp = document.createElement('meta');
	metaApp.setAttribute('property', 'fb:app_id');
	metaApp.setAttribute('content', '485127558688893');
	document.head.appendChild(metaApp);
	
	let fbSection = document.createElement('section');
	fbSection.classList.add('user-comments');
	let html = '<h2>Коментарі</h2>';
	html += '<p>Тут ви можете прокоментувати матеріали лекції, задати питання, вказати на помилки в лекції.</p>'
	fbSection.innerHTML = html;
	resize.appendChild(fbSection);
	let fbRoot = document.createElement('div');
	fbRoot.setAttribute('id', 'fb-root');
	fbSection.appendChild(fbRoot);
	
	let fbComments = document.createElement('div');
	fbComments.classList.add('fb-comments');
	fbComments.dataset.width = "750";
	fbComments.dataset.numposts = "10";
	fbComments.dataset.href = location.origin;
	fbSection.appendChild(fbComments);

	/* fb script */
	let id = 'facebook-jssdk';
	if (document.getElementById(id)) return;
	let js = document.createElement('script');
	js.setAttribute('id', id);
	js.setAttribute('src', 'https://connect.facebook.net/uk_UA/sdk.js#xfbml=1&version=v3.2&appId=485127558688893&autoLogAppEvents=1');
	document.body.appendChild(js);
})();


/* self-tests */
(function (){
	let radioId = 0;
	document.querySelectorAll('.self-tests > li').forEach(function (li){
		if (li.dataset.type === 'text') setTextQuestion(li);
		if (li.dataset.type === 'radio') setRadioQuestion(li);
		if (li.dataset.type === 'checkbox') setCheckboxQuestion(li);
	});
	function setTextQuestion(li){
		let re = new RegExp(li.dataset.res);
		li.removeAttribute('data-res');
		li.innerHTML += '<p><label><input type="text"></label> <button>Перевірити</button></p>'; 
		li.querySelector('button').addEventListener('click', function (){
			answerClass(li, re.test(li.querySelector('input').value));
		});
	}
	function setRadioQuestion(li){
		let res = +li.dataset.res;
		li.removeAttribute('data-res');
		li.querySelectorAll('p').forEach(function(p){
			p.innerHTML = '<label><input type="radio" name="st-radio_' + radioId + '"> <span>' + p.innerHTML + '</span></label>';
		});
		radioId++;
		addButton(li).addEventListener('click', function(){
			answerClass(li, li.querySelectorAll('input')[res - 1].checked);
		});
	}
	function setCheckboxQuestion(li){
		let res = li.dataset.res.split(', ').map(function(e){ return +e; });
		li.removeAttribute('data-res');
		li.querySelectorAll('p').forEach(function(p){
			p.innerHTML = '<label><input type="checkbox"> <span>' + p.innerHTML + '</span></label>';
		});
		addButton(li).addEventListener('click', function(){
			answerClass(li, test(li, res));
		});
		function test(li, res){
			let resTest = true;
			li.querySelectorAll('input').forEach(function(input, i){
				if (input.checked && !res.includes(i + 1)) resTest = false;
				if (!input.checked && res.includes(i + 1)) resTest = false;
			});
			return resTest;
		}
	}
	function answerClass(li, test){
		li.classList.remove('answer-right');
		li.classList.remove('answer-wrong');
		li.classList.add('answer-' + (test ? 'right' : 'wrong'));
	}
	function addButton(li){
		let button = document.createElement('button');
		button.innerText = 'Перевірити';
		li.appendChild(button);
		return button;
	}
})();

