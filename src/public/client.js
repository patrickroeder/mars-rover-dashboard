// immutable global data store

let store = Immutable.Map({
    user: Immutable.Map({
        name: 'John'
    }),
    currentRover: 'Opportunity',
    rovers: Immutable.List([
        Immutable.Map({
            name: 'Opportunity',
            manifest: '',
            photos: ''
        }),
        Immutable.Map({
            name: 'Curiosity',
            manifest: '',
            photos: ''
        }),
        Immutable.Map({
            name: 'Spirit',
            manifest: '',
            photos: ''
        })
    ])
});

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, newState) => {
    const mergedStore = store.merge(newState);
    console.log(mergedStore.toJS());
    render(root, mergedStore);
};

const render = async (root, state) => {
    root.innerHTML = App(state);
    initNavbar(); // TODO refactor: to be called only once at initial render
};


// create content
const App = (state) => {

    let rovers = state.toJS().rovers;
    let current = state.toJS().currentRover;
    // console.log(current);
    let currentIndex = getIndexbyName(rovers, current);

    return `
    <nav class="navbar has-shadow" role="navigation" aria-label="main navigation">
        <div class="container is-max-widescreen">
            <div class="navbar-brand">
                <div class="navbar-item">
                    <strong>Mars Rover Dashboard</strong>
                </div>
                <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false"
                    data-target="roverNavigation">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>

            <div class="navbar-menu" id="roverNavigation">
                ${RoverNavigation(rovers)}
            </div>
        </div>
    </nav>

    <section class="section">
        <div class="container is-max-widescreen">
        <div class="columns">
        <div class="column" id="information">
            ${RoverInformation(rovers, rovers[currentIndex].manifest, rovers[currentIndex].name)}
        </div>
        <div class="column is-three-quarters" id="gallery">
            ${RoverGallery(rovers, rovers[currentIndex].photos, rovers[currentIndex].name)}
        </div>
      </div>
        </div>
    </section>
    
    <footer class="footer">
            ${Footer()}
    </footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
});

const initNavbar = () => {
    /* Bulma.io Navbar JavaScript toggle
    Source: https://bulma.io/documentation/components/navbar/#navbar-menu  */

    // Get all "navbar-burger" elements
    const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    
    // Add a click event on each of them
    navbarBurgers.forEach( el => {
        el.addEventListener('click', () => {
    
        // Get the target from the "data-target" attribute
        const targetAttr = el.dataset.target;
        const target = document.getElementById(targetAttr);
    
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle('is-active')
        target.classList.toggle('is-active')
    
        });
    });
}

// ------------------------------------------------------  COMPONENTS


const RoverNavigation = (rovers) => {

    return `
    <div class="navbar-start">
        <a class="navbar-item">
            ${rovers[0].name}
        </a>

        <a class="navbar-item">
            ${rovers[1].name}
        </a>

        <a class="navbar-item">
            ${rovers[2].name}
        </a>
    </div>
    `;
};

const RoverInformation = (rovers, manifest, rover) => {
    if (!manifest) {
        getManifest(rovers, rover);
    }
    return `
        <h1 class="title">
            ${manifest.name} &nbsp; <span class="tag is-primary is-medium">${manifest.status}</span>
        </h1>
        <div class="box">
            <div>
                <p class="heading">Launch date</p>
                <p class="title">${manifest.launch_date}</p>
            </div>
        </div>
        <div class="box">
            <div>
                <p class="heading">Landing Date</p>
                <p class="title">${manifest.landing_date}</p>
            </div>
        </div>
        <div class="box">
            <div>
                <p class="heading">Total Photos</p>
                <p class="title">${manifest.total_photos}</p>
            </div>
        </div>
        <div class="box">
            <div>
                <p class="heading">Last photo taken</p>
                <p class="title">${manifest.max_sol}</p>
            </div>
        </div>
    `;
};

const RoverGallery = (rovers, photos, rover) => {
    if (!photos) {
        getPhotos(rovers, rover, rovers[getIndexbyName(rovers, rover)].manifest.max_sol - 20);
    }
    let photoItems = photos.map((photo) => {
        return `<div class="column is-one-third">
            <figure class="image is-4by3">
                <img src="${photo.img_src}">
            </figure>
            <span class="is-size-7">Taken on: ${photo.earth_date}</span>
        </div>`;
    });

    return `
    <div class="columns is-multiline" id="gallery">
        ${photoItems.join('')}
    </div>
    `;
};

const Footer = () => {
    return `
        <div class="container is-max-widescreen">
            Student Project by Patrick Roeder
        </div>`;
}

// Utilities

const getIndexbyName = (array, name) => {
    // TODO error handling for name not found (index = -1)
    return array.findIndex(a => a.name === name);
}

// ------------------------------------------------------  API CALLS

const getManifest = (rovers, rover) => {

    fetch(`http://localhost:3000/manifest/${rover}`)
        .then(res => res.json())
        .then(manifest => {
            // find our rover and append manifest
            const index = getIndexbyName(rovers, rover);
            rovers[index].manifest = manifest;
            // update store with new rover array
            updateStore(store, Immutable.fromJS({ rovers }));
        });

    return data;
};

const getPhotos = (rovers, rover, sol) => {
    fetch(`http://localhost:3000/photos/${rover}/${sol}`)
        .then(res => res.json())
        .then(photos => {
            // find our rover and append manifest
            const index = getIndexbyName(rovers, rover);
            rovers[index].photos = photos;
            // update store with new rover array
            updateStore(store, Immutable.fromJS({ rovers }));
        });

    return data;
}
