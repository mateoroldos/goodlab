import figlet from 'figlet';
import Pagga from 'figlet/importable-fonts/Pagga.js';

figlet.parseFont('Pagga', Pagga);

export const load = () => ({
	ascii: figlet.textSync('goodlab', { font: 'Pagga' })
});
