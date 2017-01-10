

setTimeout(() => {
    const name = 'Change';

    // tries to load ./Change and fails
    System.import(`./modules/${name}`)
          .then(module => module.default())
          .catch(err => console.error(err));
}, 1000);


setTimeout(() => {
    const name = 'change';

    // loads ./change.js and works
    System.import(`./${name}`)
          .then(module => module.default())
          .catch(err => console.error(err));
}, 2000);
