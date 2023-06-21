// immutable global data store

let store = Immutable.Map({
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    manifest: ''
});

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, newState) => {
    const mergedStore = store.merge(newState);
    render(root, mergedStore);
};

const render = async (root, state) => {
    root.innerHTML = App(state);
    initNavbar(); // refactor: to be called only once at initial render
};


// create content
const App = (state) => {

    let rovers = state.toJS().rovers;
    let manifest = state.toJS().manifest;

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
            ${RoverInformation(manifest, 'Curiosity')}
        </div>
        <div class="column is-three-quarters" id="gallery">
            ${RoverGallery(manifest, 'Curiosity')}
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
            ${rovers[0]}
        </a>

        <a class="navbar-item">
            ${rovers[1]}
        </a>

        <a class="navbar-item">
            ${rovers[2]}
        </a>
    </div>
    `;
};

const RoverInformation = (manifest, rover) => {
    if (!manifest) {
        getManifest(rover);
    }
    return `
        <h1 class="title">
            ${manifest[rover].photo_manifest.name} &nbsp; <span class="tag is-primary is-medium">${manifest[rover].photo_manifest.status}</span>
        </h1>
        <div class="box">
            <div>
                <p class="heading">Launch date</p>
                <p class="title">${manifest[rover].photo_manifest.launch_date}</p>
            </div>
        </div>
        <div class="box">
            <div>
                <p class="heading">Landing Date</p>
                <p class="title">${manifest[rover].photo_manifest.landing_date}</p>
            </div>
        </div>
        <div class="box">
            <div>
                <p class="heading">Total Photos</p>
                <p class="title">${manifest[rover].photo_manifest.total_photos}</p>
            </div>
        </div>
        <div class="box">
            <div>
                <p class="heading">Last photo taken</p>
                <p class="title">${manifest[rover].photo_manifest.max_sol}</p>
            </div>
        </div>
    `;
};

const RoverGallery = (manifest, rover) => {
    // TODO Placeholder
    return `
    <div class="columns is-multiline" id="gallery">
        <div class="column is-one-third">
            <figure class="image is-4by3">
                <img src="https://bulma.io/images/placeholders/640x480.png">
            </figure>
            <span class="is-size-7">Taken on: 19.12.2022 19:45</span>
        </div>
    </div>
    `;
};

const Footer = () => {
    return `
        <div class="container is-max-widescreen">
            Student Project by Patrick Roeder
        </div>`;
}

// ------------------------------------------------------  API CALLS

const getManifest = (rover) => {

    fetch(`http://localhost:3000/manifest/${rover}`)
        .then(res => res.json())
        .then(manifest => {
            let roverManifest = { [rover]: manifest };
            updateStore(store, { manifest: roverManifest });
        });

    return data;
};
