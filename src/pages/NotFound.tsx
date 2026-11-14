import { Empty } from '../components/bits'
export default function NotFound() {
  return <div className="wrap page"><Empty title="Deze pagina bestaat niet (meer)" text="Misschien is het product uitverkocht of verplaatst. Gebruik de zoekbalk of ga terug naar de homepage." cta={{ label: 'Naar de homepage', to: '/' }} /></div>
}
