import figlet from 'figlet';

export const load = () => ({
	ascii: figlet.textSync('goodlab', {
		font: 'Pagga'
	})
});
