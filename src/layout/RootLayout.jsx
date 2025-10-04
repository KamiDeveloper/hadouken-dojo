import { NavBar } from '../components/NavBar'
import { Outlet } from 'react-router-dom'

const RootLayout = () => {
    return (
        <div>
            <NavBar />
            <div id="main-app-container">
                <Outlet />
            </div>
        </div>
    )
}

export default RootLayout