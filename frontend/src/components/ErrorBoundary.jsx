import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-red-50 border border-red-200 rounded-3xl text-red-900 shadow-sm space-y-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-red-700 flex items-center">
            ⚠️ Ocurrió un error en esta pantalla
          </h2>
          <p className="text-sm font-medium">
            La aplicación ha detectado un error al renderizar esta sección. Por favor comparte este mensaje de error para solucionarlo:
          </p>
          <div className="bg-red-950 text-red-200 p-4 rounded-xl text-xs font-mono overflow-auto max-h-60 leading-relaxed shadow-inner">
            {this.state.error && this.state.error.toString()}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/10 cursor-pointer"
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
