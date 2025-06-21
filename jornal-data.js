backend:
  name: github
  repo: guilhermeprogam12/Jornal7A
  branch: main
  site_domain: guilhermeprogam12.github.io

media_folder: "assets/images"
public_folder: "/assets/images"

collections:
  - name: "configuracoes_jornal"
    label: "Configurações do Jornal"
    files:
      - label: "Notícias"
        name: "noticias"
        file: "jornal-data.js"
        parser: "javascript"
        fields:
          - name: "siteData"
            label: "Dados do Site"
            widget: "object"
            fields:
              - name: "noticias"
                label: "Lista de Notícias"
                widget: "list"
                fields:
                  - { label: "Título", name: "title", widget: "string" }
                  - { label: "Categoria", name: "category", widget: "string" }
                  - { label: "Data", name: "date", widget: "date", format: "YYYY-MM-DD" }
                  - { label: "Conteúdo", name: "content", widget: "text" }
