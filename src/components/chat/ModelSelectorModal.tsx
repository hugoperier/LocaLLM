'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'
import { webLLMService } from '@/lib/webllm'

interface ModelInfo {
  id: string
  name: string
  params: string
  size: string
  score: string
  avatar: string
}

const MODELS: ModelInfo[] = [
  {
    id: 'model-1',
    name: 'Model 1',
    params: '3B',
    size: '4GB',
    score: 'A',
    avatar: '/avatar/01.png',
  },
  {
    id: 'model-2',
    name: 'Model 2',
    params: '7B',
    size: '8GB',
    score: 'B+',
    avatar: '/avatar/02.png',
  },
  {
    id: 'model-3',
    name: 'Model 3',
    params: '13B',
    size: '16GB',
    score: 'A+',
    avatar: '/avatar/01.png',
  },
]

interface ModelSelectorModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ModelSelectorModal({ isOpen, onOpenChange }: ModelSelectorModalProps) {
  const [installed, setInstalled] = useState<string[]>([])
  const [installingId, setInstallingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('installedModels')
    if (stored) {
      setInstalled(JSON.parse(stored))
    }
  }, [])

  const updateInstalled = (models: string[]) => {
    setInstalled(models)
    localStorage.setItem('installedModels', JSON.stringify(models))
  }

  const handleInstall = async (id: string) => {
    setError(null)
    setInstallingId(id)
    try {
      await webLLMService.loadModel(id)
      updateInstalled([...installed, id])
    } catch (e) {
      console.error(e)
      setError('Erreur lors du téléchargement du modèle')
    } finally {
      setInstallingId(null)
    }
  }

  const handleRemove = (id: string) => {
    updateInstalled(installed.filter(m => m !== id))
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
            {MODELS.map(model => {
              const isInstalled = installed.includes(model.id)
              const isLoading = installingId === model.id
              return (
                <div key={model.id} className="flex items-center justify-between rounded-lg border p-3">
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
                    <span className={`text-sm ${isInstalled ? 'text-green-600' : 'text-red-600'}`}>{isInstalled ? 'Installé' : 'Non installé'}</span>
                    <Button
                      size="sm"
                      variant={isInstalled ? 'destructive' : 'secondary'}
                      disabled={isLoading}
                      onClick={() => (isInstalled ? handleRemove(model.id) : handleInstall(model.id))}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isInstalled ? 'Supprimer' : 'Télécharger'}
                    </Button>
                  </div>
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

