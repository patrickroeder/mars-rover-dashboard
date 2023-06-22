// immutable global data store

let store = Immutable.Map({
    user: Immutable.Map({
        name: 'John'
    }),
    currentRover: 'Spirit',
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

const updateStore = (store, key, newState) => {
    store = store.set(key, newState);
    console.log(store.toJS());
    render(root, store);
};

const render = async (root, state) => {
    root.innerHTML = App(state);
    initNav();
};

// create content
const App = (state) => {

    let rovers = state.toJS().rovers;
    let current = state.toJS().currentRover;
    console.log('Current Rover: '+ current);
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

            ${RoverNavigation(NavItems, rovers)}
        </div>
    </nav>

    <section class="section">
        <div class="container is-max-widescreen">
        <div class="columns">
        <div class="column" id="information">
            ${RoverInformation(rovers, rovers[currentIndex].manifest, rovers[currentIndex].name)}
        </div>
        <div class="column is-three-quarters" id="gallery">
            ${RoverGallery(GalleryItems, rovers, rovers[currentIndex].photos, rovers[currentIndex].name)}
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

const initNav = () => {
    // Get the parent div element
    const parentDiv = document.getElementById('roverNavigation');
    // Get all the anchor tags inside the parent div and convert them into an array
    const anchorTags = Array.from(parentDiv.getElementsByTagName('a'));
    // Attach event listeners to each anchor tag using map()
    anchorTags.map(anchor => {
        anchor.addEventListener('click', function() {
            const rover = this.textContent.trim();
            console.log('Anchor tag clicked:', rover);
            // update store
            store = store.set('currentRover', rover);
            render(root, store);
        });
    });
}

// ------------------------------------------------------  COMPONENTS


const RoverNavigation = (itemsCallback, rovers) => {
    return `
    <div class="navbar-menu" id="roverNavigation">
        <div class="navbar-start">
            ${itemsCallback(rovers)}
        </div>
    </div>
    `;
};

const NavItems = (rovers) => {
    let navItems = rovers.map((rover) => {
        return `<a class="navbar-item">
            ${rover.name}
        </a>`
    });
    return navItems.join('');
}

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
                <p class="title">${manifest.max_date}</p>
            </div>
        </div>
    `;
};

const RoverGallery = (itemsCallback, rovers, photos, rover) => {
    if (!photos) {
        getPhotos(rovers, rover, rovers[getIndexbyName(rovers, rover)].manifest.max_sol);
    }

    return `
    <div class="columns is-multiline" id="gallery">
        ${itemsCallback(photos)}
    </div>
    `;
};

const GalleryItems = (photos) => {
    let photoItems = photos.map((photo) => {
        return `<div class="column is-one-third">
            <figure class="image is-4by3">
                <img src="${photo.img_src}">
            </figure>
            <span class="is-size-7">Taken on: ${photo.earth_date}</span> <span class="tag is-light">${photo.camera.name}</span>
        </div>`;
    });
    return photoItems.join('');
}

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
            console.log(`Get manifest for ${rover}`);

            // TODO refactor: update store in a single place
            // update store with new manifest
            const retrievedRovers = store.get('rovers');
            const index = retrievedRovers.findIndex(r => r.get('name') === rover);
            const updatedRovers = retrievedRovers.setIn([index, 'manifest'], manifest);
            store = store.set('rovers', updatedRovers);
            console.log(store.toJS());
            render(root, store);
        });

    return data;
};

const getPhotos = (rovers, rover, sol) => {
    fetch(`http://localhost:3000/photos/${rover}/${sol}`)
        .then(res => res.json())
        .then(photos => {
            // find our rover and append manifest
            console.log(`Get photos for ${rover}`);

            // TODO refactor
            // update store with new photos
            const retrievedRovers = store.get('rovers');
            const index = retrievedRovers.findIndex(r => r.get('name') === rover);
            const updatedRovers = retrievedRovers.setIn([index, 'photos'], photos);
            store = store.set('rovers', updatedRovers);
            console.log(store.toJS());
            render(root, store);
        });

    return data;
}
