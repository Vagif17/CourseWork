let container = document.querySelector('#container')
let input = document.querySelector('#inputFile')
let btn = document.querySelector('#addBtn')

btn.addEventListener('click', () => {
    /* Диалаговое окно и добавление с помощью URL.createObjectURL помог GPT,мой вариант добавлял
       фотографию без возможости выбора конкретной фотографии(Фото уже было в папке с проектом)
       поэтому я обратился к GPT
     */
   if (input.files.length > 0)
   {
       let file = input.files[0]
       let img = document.createElement('img');
       img.src = URL.createObjectURL(file)
       img.classList.add('img')
       img.style.maxHeight = '20%';
       img.style.maxWidth = '20%';
       container.append(img);
   }
   else
   {
       alert("Select image")
   }
})

let img = document.querySelector('.img');

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('img')) {
        e.target.style.maxWidth = `${parseInt(e.target.style.maxWidth)+ 1}%`
        e.target.style.maxHeight = `${parseInt(e.target.style.maxHeight)+ 1}%`
    }
})
