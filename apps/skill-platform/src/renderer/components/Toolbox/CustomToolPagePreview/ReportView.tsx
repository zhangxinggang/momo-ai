import type { ToolReport } from '@/shared/tool-page';
import { useState } from 'react';
import { FilePreviewView } from '../CustomToolOpenUIPreview/WorkspaceComponents';
import styles from './index.module.less';

export function ReportView({ report }: { report: ToolReport }) {
  const [selected, setSelected] = useState('');
  const [groups, setGroups] = useState<Record<string, string>>({});
  const section = report.sections.find((item) => item.id === selected) || report.sections[0];
  const group = section.groups.find((item) => item.id === groups[section.id]) || section.groups[0];
  return (
    <article className={styles.report}>
      <header className={styles.reportHeading}>
        <span>分析报告</span>
        <h1>{report.title}</h1>
        <p>{report.summary}</p>
      </header>
      <nav className={styles.tabs} aria-label='报告章节'>
        {report.sections.map((item) => (
          <button
            type='button'
            key={item.id}
            aria-current={item === section ? 'page' : undefined}
            onClick={() => setSelected(item.id)}>
            {item.title}
          </button>
        ))}
      </nav>
      {section.groups.length > 0 && (
        <nav className={styles.groups} aria-label={`${section.title}分组`}>
          {section.groups.map((item) => (
            <button
              type='button'
              key={item.id}
              aria-pressed={item === group}
              onClick={() => setGroups({ ...groups, [section.id]: item.id })}>
              {item.title}
            </button>
          ))}
        </nav>
      )}
      <section className={styles.content} aria-label={group?.title || section.title}>
        {!group ? (
          <p className={styles.empty}>{section.emptyMessage}</p>
        ) : (
          group.blocks.map((block, index) => (
            <section key={index} className={styles.block}>
              {block.title && <h2>{block.title}</h2>}
              {block.type === 'table' ? (
                <div className={styles.tableScroll}>
                  <table>
                    <thead>
                      <tr>
                        {block.columns.map((title, i) => (
                          <th key={i}>{title}</th>
                        ))}
                        <th className={styles.source}>出处</th>
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, i) => (
                        <tr key={i}>
                          {row.cells.map((text, j) => (
                            <td key={j}>{text}</td>
                          ))}
                          <td className={styles.source}>{row.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!block.rows.length && <p>本组暂无条目</p>}
                </div>
              ) : block.type === 'text' ? (
                <>
                  <p className={styles.text}>{block.text}</p>
                  {block.source && <aside className={styles.evidence}>出处：{block.source}</aside>}
                </>
              ) : (
                <>
                  <FilePreviewView
                    {...({ props: { sourceId: block.sourceId, height: 560 } } as any)}
                  />
                  <aside className={styles.evidence}>出处：{block.source}</aside>
                </>
              )}
            </section>
          ))
        )}
      </section>
    </article>
  );
}
