let choice;
let income = {};
let expense = {};
let total = {};

while (choice !== "итог")
{
    choice = prompt("Доход/Расход/Итог").toLowerCase();
    switch (choice)
    {
        case "доход":
        {
            let name = prompt("Названия").toLowerCase();
            let money = Number (prompt("Сумма", 0));

            if (income[name] === undefined)
            {
                income[name] = money;
            }
            else
            {
                income[name] += money;
            }

            break;
        }

        case "расход":
        {
            let name = prompt("Названия").toLowerCase();
            let money = Number (prompt ("Сумма", 0));

            if (expense[name] === undefined)
            {
                expense[name] = money;
            }
            else
            {
                expense[name] += money;
            }            break;
        }
        case "итог":
        {
            total = { "Доход": income, "Расход": expense };

            let incomeText = "Доходы:\n";
            for (let name in income) {
                incomeText += `${name}: ${income[name]}\n`;
            }

            let expenseText = "Расходы:\n";
            for (let name in expense) {
                expenseText += `${name}: ${expense[name]}\n`;
            }

            alert(incomeText + "\n" + expenseText);
            break;
        }
    }
}
