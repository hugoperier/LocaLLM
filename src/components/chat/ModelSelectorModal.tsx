'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Download, CheckCircle2 } from 'lucide-react'
import { AVAILABLE_MODELS, webLLMService } from '@/lib/webllm'
import { Progress } from '@/components/ui/progress'

interface ModelSelectorModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

interface DownloadProgress {
  progress: number
  timeElapsed: number
  text: string
}

export function ModelSelectorModal({ isOpen, onOpenChange }: ModelSelectorModalProps) {
  const [installed, setInstalled] = useState<string[]>([])
  const [installingId, setInstallingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)

  useEffect(() => {
    setInstalled(webLLMService.getInstalledModels())
  }, [])

  useEffect(() => {
    if (installingId) {
      webLLMService.setStatusCallback((status) => {
        setDownloadProgress({
          progress: status.progress,
          timeElapsed: status.timeElapsed,
          text: status.text
        })
      })
    } else {
      setDownloadProgress(null)
    }
  }, [installingId])

  const handleInstall = async (id: string) => {
    setError(null)
    setInstallingId(id)
    try {
      await webLLMService.installModel(id)
      setInstalled(webLLMService.getInstalledModels())
    } catch (e) {
      console.error(e)
      setError('Erreur lors du téléchargement du modèle')
    } finally {
      setInstallingId(null)
    }
  }

  const handleRemove = (id: string) => {
    webLLMService.removeModel(id)
    setInstalled(webLLMService.getInstalledModels())
  }

  const formatSize = (text: string) => {
    const match = text.match(/(\d+(?:\.\d+)?)\s*([A-Za-z]+)/)
    if (match) {
      const [, size, unit] = match
      return `${size} ${unit}`
    }
    return ''
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gérer les modèles</DialogTitle>
          <DialogDescription>Sélectionnez les modèles à installer localement</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-4">
            {AVAILABLE_MODELS.map(model => {
              const isInstalled = webLLMService.isModelInstalled(model.id)
              const isLoading = installingId === model.id
              return (
                <div key={model.id} className="flex flex-col rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={model.avatar} alt={model.name} />
                        <AvatarFallback>{model.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {model.params} · {model.size} · Score {model.score}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${isInstalled ? 'text-green-600' : 'text-red-600'}`}>
                        {isInstalled ? 'Installé' : 'Non installé'}
                      </span>
                      <Button
                        size="sm"
                        variant={isInstalled ? 'destructive' : 'secondary'}
                        disabled={isLoading}
                        onClick={() => (isInstalled ? handleRemove(model.id) : handleInstall(model.id))}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isInstalled ? (
                          'Supprimer'
                        ) : (
                          'Télécharger'
                        )}
                      </Button>
                    </div>
                  </div>
                  {isLoading && downloadProgress && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <span>Téléchargement en cours...</span>
                        </div>
                      </div>
                      <Progress value={downloadProgress.progress * 100} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatSize(downloadProgress.text)}</span>
                        <span>{Math.round(downloadProgress.progress * 100)}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Le modèle sera disponible hors ligne et plus rapide aux prochains chargements
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
        {error && <div className="pt-2 text-sm text-destructive">{error}</div>}
      </DialogContent>
    </Dialog>
  )
}

