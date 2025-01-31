"use client"
import type { ExtendedTransaction } from "@/lib/mock-data"
import ReactFlow, { type Node, type Edge, Handle, Position } from "reactflow"
import "reactflow/dist/style.css"

interface TransactionFlowchartProps {
  transactions: ExtendedTransaction[]
}

export function TransactionFlowchart({ transactions }: TransactionFlowchartProps) {
  const nodes: Node[] = []
  const edges: Edge[] = []

  transactions.forEach((transaction) => {
    nodes.push({
      id: transaction.id,
      data: {
        label: `${transaction.type}`,
        amount: `${transaction.assetAmount.amount} ${transaction.assetAmount.unit}`,
        date: transaction.timestampText,
        price: `$${transaction.transactionAmountFiat.amount.toFixed(2)}`,
      },
      position: { x: 0, y: 0 },
      type: "custom",
    })

    if (transaction.taxLotRelations) {
      transaction.taxLotRelations.forEach((relation) => {
        edges.push({
          id: `${relation.buyTransactionId}-${relation.sellTransactionId}`,
          source: relation.buyTransactionId,
          target: relation.sellTransactionId,
          label: `${relation.amount} ${transaction.assetAmount.unit}`,
          type: "smoothstep",
        })
      })
    }
  })

  // Simple layout algorithm
  const buyNodes = nodes.filter((node) => node.data.label.startsWith("BUY"))
  const sellNodes = nodes.filter((node) => node.data.label.startsWith("SELL"))

  buyNodes.forEach((node, index) => {
    node.position = { x: 100, y: 100 + index * 200 }
  })

  sellNodes.forEach((node, index) => {
    node.position = { x: 600, y: 100 + index * 200 }
  })

  const CustomNode = ({ data }: { data: any }) => (
    <div className="bg-card text-card-foreground p-2 rounded-md shadow-md relative">
      {data.label.startsWith("BUY") && (
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
      )}
      {data.label.startsWith("SELL") && (
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-red-500" />
      )}
      <div className="font-bold">{data.label}</div>
      <div>Amount: {data.amount}</div>
      <div>Date: {data.date}</div>
      <div>Price: {data.price}</div>
    </div>
  )

  const nodeTypes = {
    custom: CustomNode,
  }

  return (
    <div style={{ height: "500px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodeTypes={nodeTypes}
        connectionLineStyle={{ stroke: "#ddd", strokeWidth: 2 }}
        defaultEdgeOptions={{ style: { stroke: "#ddd", strokeWidth: 2 }, labelBgStyle: { fill: "#fff" } }}
      />
    </div>
  )
}

