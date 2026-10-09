// Tela provisória das páginas que ainda serão construídas.
export default function EmBreve({ titulo }) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>{titulo}</h1>
          <p className="page-subtitle">Esta tela será a próxima a ser construída.</p>
        </div>
      </header>
      <div className="card state">
        <p>Em breve.</p>
      </div>
    </>
  );
}
