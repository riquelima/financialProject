import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Você também pode logar o erro para um serviço de گزارش de erros
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback
      return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh', 
            padding: '20px',
            backgroundColor: '#1E1E1E', 
            color: '#E0E0E0',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center'
          }}>
          <h1 style={{ fontSize: '24px', color: '#FF6B6B' }}>Oops! Algo deu errado.</h1>
          <p style={{ fontSize: '16px', marginTop: '10px' }}>Tente recarregar a página. Se o problema persistir, por favor, contate o suporte.</p>
          {this.state.error && (
            <pre style={{ 
                marginTop: '20px', 
                padding: '10px', 
                backgroundColor: '#2E2E2E', 
                border: '1px solid #444', 
                borderRadius: '4px', 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-all',
                maxHeight: '300px',
                overflowY: 'auto',
                fontSize: '12px',
                textAlign: 'left',
                maxWidth: '90vw'
              }}>
              <strong>Erro:</strong> {this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack && (
                <>
                  <br />
                  <br />
                  <strong>Stack Trace do Componente:</strong>
                  {this.state.errorInfo.componentStack}
                </>
              )}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
