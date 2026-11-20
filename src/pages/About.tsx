function About() {
    return (
        <section id = "aboutMain" style={{padding: "0 5%"}}>
            <h1 style={{lineHeight: 1.5}}>
                StarRing, by Edwin&nbsp;Fredy
            </h1>

            <p>
                Hi I'm Edwin, and I built this little project out of boredom. Hope you like it. You can suggest improvements <a href="https://github.com/edwinfredy/star-ring/issues/" target="_blank">on GitHub</a>, or <a href="mailto:edwinfredy8@gmail.com">shoot me an email</a> if you'd like.
            </p>

            <h2>
                Credits
            </h2>

            <p>
                City data sourced from <a href="https://bamwor.com"> World Cities Dataset 2026</a> by Bamwor, based on GeoNames.
                Licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. (Modified for this project).
            </p>
            <br />
            <p>
                Star data sourced from the <a href="https://simbad.cfa.harvard.edu/simbad/">SIMBAD Astronomical Database</a>.
                Licensed under <a href="https://opendatacommons.org/licenses/odbl/1-0/">Open Database License v1.0</a>. (Modified for this Project).
            </p>
            <br />
            <p>
                3-D asset(s) sourced from <a href="https://science.nasa.gov/3d-resources/">NASA 3D Resources</a>.
                Available in the public domain. (Modified for this project).
            </p>

            <h2>
                Bright Star Catalogue
            </h2>
            <p>
                This project references stars via the <a href="http://tdc-www.harvard.edu/catalogs/bsc5.html">Bright Star Catalogue</a> (also known as Yale Bright Star Catalouge), and can be used to identify all objects with a magnitude of 6.5 or brighter, which includes 9095 stars, 11 novae or supernovae and 4 non-stellar objects. Stars are referenced in the BSC with the prefix '<b>HR</b>' (which stands for 'Harvard Revised'). </p> <br /> <p> The catalogue was originally published in 1908.
            </p>
        </section>
    )
}

export default About;