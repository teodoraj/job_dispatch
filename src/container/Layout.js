import React from 'react';
import classes from './Layout.module.css'
import menuBar from '../static/nav_bar.svg'


const Layout = (props) =>{
    return (
        <main className={classes.layout_main}>
            <a href='/' className={classes.menu_link}>
                <img src={menuBar} className={classes.menu_bar_image} alt='menu' />
            </a>

            <div className={classes.layout_container}>{props.children}</div>
        </main>
    )
}

export default Layout;