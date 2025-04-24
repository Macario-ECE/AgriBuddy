import type { KnowledgeCard as KnowledgeCardType } from '@shared/schema';

interface KnowledgeCardProps {
  card: KnowledgeCardType;
}

export default function KnowledgeCard({ card }: KnowledgeCardProps) {
  const { title, content, type, icon } = card;
  
  return (
    <div className="knowledge-card bg-white rounded-2xl p-4 shadow border-l-4 border-secondary">
      <div className="font-serif font-semibold text-lg mb-2 text-primary-dark">
        {title}
      </div>
      
      {type === 'text' && (
        <p>{content as string}</p>
      )}
      
      {type === 'list' && Array.isArray(content) && (
        <ul className="space-y-1">
          {(content as string[]).map((item, index) => (
            <li key={index} className="flex items-start">
              <i className={`fas ${icon || 'fa-check'} text-accent mt-1 mr-3 w-5 text-center`}></i>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      
      {type === 'table' && Array.isArray(content) && (
        <div className="space-y-3">
          {(content as { label: string; value: string }[]).map((item, index) => (
            <div key={index} className="flex items-start">
              <i className={`fas ${icon || 'fa-info-circle'} text-accent mt-1 mr-3 w-5 text-center`}></i>
              <div>
                <span className="font-medium">{item.label}:</span> {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
