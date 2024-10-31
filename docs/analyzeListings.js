window.addEventListener('load', (event) => {
    const body = JSON.stringify({
        asinList: ['B0D9KZKYWX', 'B0BVB8STGS', 'B0BPHJ8LJD', 'B01N9BE85S', 'B01H6FC8KQ', 'B08NVMDVSJ', 'B07JN1BGK9', 'B07WZLZCPJ', 'B07712VZ68', 'B0CTKKCYRF']
    });
    fetch('/analyzeBulletpoints', {
        method: 'POST', // default, so we can ignore
        body: body,
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    }).then((response) => response.json())
        .then((json) => console.log(json));
});