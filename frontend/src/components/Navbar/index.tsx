import React from "react";
import { Nav, NavLink, NavMenu } from "./NavbarElements";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar: React.FC = () => {
	return (
		<>
			<Nav>
				<NavMenu>
					<NavLink to="/">
						Home
					</NavLink>
				</NavMenu>
				<ConnectButton />
			</Nav>
		</>
	);
};

export default Navbar;
