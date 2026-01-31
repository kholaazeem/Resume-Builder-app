import { Container, Button, Card } from 'react-bootstrap';

function App() {
  return (
    <Container className="mt-5 text-center">
      <Card>
        <Card.Body>
          <h1>Resume Builder 🚀</h1>
          <p>React Bootstrap is working perfectly!</p>
          <Button variant="primary">Let's Start</Button>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default App;