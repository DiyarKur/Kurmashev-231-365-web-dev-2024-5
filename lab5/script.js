'use strict';

let page = 1;
let perPage = 5;
let totalPage = 0;
let totalRecords = 0;
let q = '';

let btnBack = document.querySelector('.footer');
let selectPerPage = document.querySelector('.select-perpage');
let searchInput = document.querySelector('.input');
let autocomplete = document.querySelector('.autocomplete');

function renderBlockBtns() {
    const begin = (page - 2 > 1) ? page - 2 : 1;
    const end = (page + 2 > totalPage) ? totalPage : page + 2;
    const blockBtns = document.querySelector('.block-btns');
    blockBtns.innerHTML = '';
    for (let i = begin; i <= end; i++) {
        const btn = document.createElement('button');
        btn.classList.add('btn');
        btn.textContent = i;
        if (i === page) btn.classList.add('active');
        blockBtns.append(btn);
    }
}

function renderCountRecord() {
    let from = document.querySelector('.from');
    from.textContent = (page - 1) * perPage + 1;
    let to = document.querySelector('.to');
    to.textContent = (page * perPage > totalRecords) ? totalRecords : page * perPage;
    let total = document.querySelector('.total');
    total.textContent = totalRecords;
}

function loadData() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `http://cat-facts-api.std-900.ist.mospolytech.ru/facts?page=${page}&per-page=${perPage}&q=${q}`);
    xhr.send();
    xhr.onload = function () {
        if (xhr.status === 200) {
            let response = JSON.parse(xhr.response);
            let posts = document.querySelector('.posts');
            let template = document.querySelector('#post');
            posts.innerHTML = '';
            for (const record of response.records) {
                let clone = template.content.cloneNode(true);
                let text = clone.querySelector('.upper_post');
                text.textContent = record.text;
                let author = clone.querySelector('.author');
                author.textContent = `${record.user?.name?.first} ${record?.user?.name?.last}`;
                let upvotes = clone.querySelector('.upvotes');
                upvotes.textContent = record.upvotes;
                posts.append(clone);
            }
            totalPage = response._pagination.total_pages;
            totalRecords = response._pagination.total_count;
            renderBlockBtns();
            renderCountRecord();
        } else {
            console.log('Ошибка при выполнении запроса');
        }
    };
    xhr.onerror = function () {
        console.log('Ошибка');
    };
}

function clickFooter(event) {
    const target = event.target;
    if (target.classList.contains('btn-back')) {
        if (page - 1 < 1) {
            return;
        }
        page -= 1;
        loadData();
        return;
    }
    if (target.classList.contains('btn-forward')) {
        if (page + 1 > totalPage) {
            return;
        }
        page += 1;
        loadData();
        return;
    }
    if (target.classList.contains('btn')) {
        page = +target.textContent;
        loadData();
    }
}

function search() {
    q = searchInput.value.trim();
    loadData();
}

function autocompleteSearch() {
    q = searchInput.value.trim();
    if (q.length > 0) {
        fetch(`http://cat-facts-api.std-900.ist.mospolytech.ru/autocomplete?q=${q}`)
            .then(response => response.json())
            .then(data => {
                // Очищаем предыдущие результаты автодополнения
                autocomplete.innerHTML = '';
                // Проверяем, есть ли данные для автодополнения
                if (data && data.length > 0) {
                    // Создаем элементы для отображения автодополнения
                    data.forEach(item => {
                        const option = document.createElement('div');
                        option.classList.add('autocomplete-item');
                        option.textContent = item;
                        // Добавляем обработчик клика на каждый вариант автодополнения
                        option.addEventListener('click', () => {
                            searchInput.value = item;
                            autocomplete.innerHTML = ''; // Скрываем список автодополнения после выбора
                            search(); // Выполняем поиск
                        });
                        autocomplete.appendChild(option);
                    });
                }
            })
            .catch(error => console.error('Ошибка получения данных для автодополнения:', error));
    } else {
        autocomplete.innerHTML = ''; // Очищаем список автодополнения, если строка поиска пуста
    }
}


function handleAutocompleteClick(event) {
    if (event.target.classList.contains('autocomplete-item')) {
        searchInput.value = event.target.textContent;
        autocomplete.innerHTML = ''; // Скрыть автодополнение после выбора
        search(); // Выполнить поиск
    }
}

btnBack.addEventListener('click', clickFooter);
selectPerPage.addEventListener('change', (event) => {
    perPage = +event.target.value;
    loadData();
});
searchInput.addEventListener('input', autocompleteSearch);
autocomplete.addEventListener('click', handleAutocompleteClick);
document.querySelector('.btn-search').addEventListener('click', search);

window.onload = loadData;
